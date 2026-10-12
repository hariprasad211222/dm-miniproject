import os
import tempfile
import unittest
from unittest.mock import patch

import pandas as pd

import db
import llm_service


class TestLLM(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp()
        os.environ["DMAUT_DATA_DIR"] = self.tmp
        db.init_db()
        self.actor = "alice"
        self.context = {
            "dataset": {"name": "demo", "n_customers": 120, "overall_conversion_rate": 0.18},
            "segments": [{"name": "High-Value Loyalists", "customers": 40, "avg_income": 60000.0, "avg_past_spend": 1200.0, "avg_website_visits": 9.0, "avg_email_open_rate": 0.45, "conversion_rate": 0.27}],
            "model": {"cv_accuracy": 0.77, "roc_auc": 0.81, "top_drivers": [{"feature": "email_open_rate", "direction": "up", "strength": 0.73}]},
            "optimization": {"target_pct": 40, "n_targeted": 48, "baseline_rate": 0.16, "targeted_rate": 0.22, "relative_lift": 0.38},
        }

    def tearDown(self):
        import shutil
        shutil.rmtree(self.tmp, ignore_errors=True)

    def test_context_omits_customer_identity_and_stays_small(self):
        df = pd.DataFrame({
            "customer_id": ["c1", "c2"],
            "age": [35, 40],
            "income": [50000, 70000],
            "past_spend": [2000, 3000],
            "website_visits": [5, 8],
            "email_open_rate": [0.4, 0.5],
            "days_since_last_purchase": [20, 15],
            "converted": [1, 0],
        })
        context = llm_service.build_context("demo", df, {}, {}, {}, 40)
        self.assertNotIn("customer_id", str(context))
        self.assertNotIn("c1", str(context))
        self.assertLess(len(str(context).encode("utf-8")), 6000)

    def test_question_over_1000_chars_is_rejected(self):
        reply = llm_service.ask_assistant("x" * 1001, [], self.context, self.actor)
        self.assertFalse(reply.ok)
        self.assertIn("question", reply.text.lower())

    def test_rate_limit_blocks_21st_request(self):
        for _ in range(20):
            db.log_event(self.actor, "user", "assistant_query", "chars=8")
        reply = llm_service.ask_assistant("Is this working?", [], self.context, self.actor)
        self.assertFalse(reply.ok)
        self.assertEqual(reply.error_code, "rate_limited")

    def test_retry_on_429_then_success(self):
        with patch.object(llm_service.requests, "post") as post:
            post.side_effect = [
                type("Resp", (), {"status_code": 429, "text": "try again", "raise_for_status": lambda self: None})(),
                type("Resp", (), {"status_code": 200, "json": lambda self: {"candidates": [{"content": {"parts": [{"text": "ok"}]}}]}, "raise_for_status": lambda self: None})(),
            ]
            with patch.object(llm_service, "LLM_API_KEY", "abc123", create=True):
                reply = llm_service.ask_assistant("What should I do?", [], self.context, self.actor)
        self.assertTrue(reply.ok)
        self.assertEqual(reply.text, "ok")

    def test_gemini_payload_uses_system_instruction_not_key_param(self):
        payload = llm_service._build_gemini_payload("hello", "context", 0.2, 128)
        self.assertIn("systemInstruction", payload)
        self.assertNotIn("key=", str(payload))


if __name__ == "__main__":
    unittest.main()
