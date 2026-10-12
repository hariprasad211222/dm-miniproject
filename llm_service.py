from __future__ import annotations

import json
import os
import time
from types import SimpleNamespace

import pandas as pd
import requests

import db

LLM_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("OPENAI_API_KEY") or ""
LLM_RATE_LIMIT = int(os.getenv("DMAUT_LLM_RATE_LIMIT", "20"))
LLM_TIMEOUT_SECONDS = int(os.getenv("DMAUT_LLM_TIMEOUT_SECONDS", "15"))


def _safe_float(value, default=0.0):
    try:
        return float(value)
    except (TypeError, ValueError):
        return float(default)


def build_context(dataset_name, df, profile, model, optimization, target_pct):
    """Build a compact, aggregate-only context block for the LLM to analyze."""
    if df is None:
        df = pd.DataFrame()
    summary = {
        "dataset": {
            "name": dataset_name or "demo",
            "n_customers": int(len(df)),
            "overall_conversion_rate": _safe_float(df["converted"].mean()) if "converted" in df.columns else 0.0,
        }
    }

    segments = []
    if profile is not None:
        if hasattr(profile, "to_dict"):
            records = profile.to_dict(orient="records")
        else:
            records = list(profile)
        for row in records:
            if isinstance(row, dict):
                segments.append(
                    {
                        "name": row.get("segment") or row.get("name") or "segment",
                        "customers": int(row.get("customers", 0) or 0),
                        "avg_income": _safe_float(row.get("income")),
                        "avg_past_spend": _safe_float(row.get("past_spend")),
                        "avg_website_visits": _safe_float(row.get("website_visits")),
                        "avg_email_open_rate": _safe_float(row.get("email_open_rate")),
                        "conversion_rate": _safe_float(row.get("conversion_rate")),
                    }
                )
    summary["segments"] = segments

    model_info = {
        "cv_accuracy": 0.0,
        "roc_auc": 0.0,
        "top_drivers": [],
    }
    if model is not None:
        model_info["cv_accuracy"] = _safe_float(getattr(model, "accuracy", 0.0))
        model_info["roc_auc"] = _safe_float(getattr(model, "roc_auc", 0.0))
        coef = getattr(model, "coefficients", None)
        if coef is not None:
            coefs = []
            for feature, value in coef.items():
                if feature == "customer_id":
                    continue
                coefs.append({
                    "feature": feature,
                    "direction": "up" if value >= 0 else "down",
                    "strength": abs(float(value)),
                })
            model_info["top_drivers"] = sorted(coefs, key=lambda item: item["strength"], reverse=True)[:5]
    summary["model"] = model_info

    optimization_info = {
        "target_pct": int(target_pct or 40),
        "n_targeted": 0,
        "baseline_rate": 0.0,
        "targeted_rate": 0.0,
        "relative_lift": 0.0,
    }
    if optimization is not None:
        optimization_info.update({
            "target_pct": int(getattr(optimization, "target_pct", target_pct or 40)),
            "n_targeted": int(getattr(optimization, "n_targeted", 0)),
            "baseline_rate": _safe_float(getattr(optimization, "baseline_rate", 0.0)),
            "targeted_rate": _safe_float(getattr(optimization, "targeted_rate", 0.0)),
            "relative_lift": _safe_float(getattr(optimization, "lift", 0.0)),
        })
    summary["optimization"] = optimization_info
    return summary


def _build_gemini_payload(prompt, context, temperature=0.2, max_tokens=128):
    return {
        "contents": [{"parts": [{"text": prompt}]}],
        "systemInstruction": {"parts": [{"text": f"You are DMaut AI. Use only the provided aggregate context and do not expose raw customer data.\n\nContext:\n{json.dumps(context, ensure_ascii=False)}"}]},
        "generationConfig": {
            "temperature": float(temperature),
            "maxOutputTokens": int(max_tokens),
            "candidateCount": 1,
        },
    }


def ask_assistant(question, history, context, actor):
    """Return a SimpleNamespace with ok, text, and optional error_code."""
    question = (question or "").strip()
    if not question or len(question) > 1000:
        return SimpleNamespace(ok=False, text="Question must be 1-1000 characters long.", error_code="invalid_question")

    if db.count_events(actor, "assistant_query", 60) >= LLM_RATE_LIMIT:
        return SimpleNamespace(ok=False, text="Rate limit exceeded. Please try again later.", error_code="rate_limited")

    api_key = LLM_API_KEY or os.getenv("GEMINI_API_KEY") or os.getenv("OPENAI_API_KEY") or ""
    if not api_key:
        return SimpleNamespace(ok=False, text="The AI assistant is not configured yet.", error_code="api_key_missing")

    payload = _build_gemini_payload(question, context, 0.2, 256)
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + api_key

    last_error = None
    for attempt in range(2):
        try:
            response = requests.post(url, json=payload, timeout=LLM_TIMEOUT_SECONDS)
            if response.status_code == 429:
                last_error = "rate_limited"
                time.sleep(0.25)
                continue
            response.raise_for_status()
            data = response.json()
            text = ""
            candidate = (data.get("candidates") or [{}])[0]
            content = candidate.get("content") or {}
            for part in content.get("parts", []):
                if isinstance(part, dict) and "text" in part:
                    text += part["text"]
            if not text:
                text = "I couldn't generate an answer from the current audience context."
            db.log_event(actor, "user", "assistant_query", f"chars={len(question)}")
            return SimpleNamespace(ok=True, text=text, error_code=None)
        except Exception as exc:  # pragma: no cover - exercised by production runtime
            last_error = type(exc).__name__
            if attempt == 0:
                time.sleep(0.25)
                continue
            db.log_event(actor, "user", "assistant_query", f"error={last_error}")
            return SimpleNamespace(ok=False, text=f"The AI assistant could not answer your question: {exc}", error_code="request_failed")

    db.log_event(actor, "user", "assistant_query", f"error={last_error}")
    return SimpleNamespace(ok=False, text="The AI assistant is temporarily unavailable.", error_code=last_error or "request_failed")
