import unittest
import pandas as pd
import numpy as np
import core_engine as engine

class TestCoreMarketingEngine(unittest.TestCase):
    def setUp(self):
        self.df = engine.generate_marketing_data(n_samples=300, random_state=42)

    def test_data_generation(self):
        self.assertEqual(len(self.df), 300)
        for col in engine.FEATURES + ["converted", "customer_id"]:
            self.assertIn(col, self.df.columns)
        self.assertTrue(set(self.df["converted"].unique()).issubset({0, 1}))

    def test_segmentation(self):
        segmented_df, summary = engine.perform_segmentation(self.df, n_clusters=4)
        self.assertEqual(len(segmented_df), 300)
        self.assertIn("persona", segmented_df.columns)
        self.assertEqual(len(summary), 4)
        self.assertTrue(any("High-Value" in p for p in summary["persona"]))

    def test_conversion_model_logistic(self):
        res = engine.train_conversion_model(self.df, model_type="Logistic Regression")
        self.assertGreater(res["accuracy"], 0.5)
        self.assertGreater(res["roc_auc"], 0.5)
        self.assertEqual(len(res["probabilities"]), len(self.df))

    def test_conversion_model_random_forest(self):
        res = engine.train_conversion_model(self.df, model_type="Random Forest")
        self.assertGreater(res["accuracy"], 0.5)
        self.assertGreater(res["roc_auc"], 0.5)

    def test_campaign_simulation(self):
        res_model = engine.train_conversion_model(self.df)
        sim = engine.simulate_campaign(self.df, res_model["probabilities"], top_pct=30)
        self.assertEqual(sim["n_target"], round(len(self.df) * 0.3))
        self.assertGreaterEqual(sim["targeted_rate"], sim["baseline_rate"])
        self.assertGreater(sim["savings"], 0)
        self.assertEqual(len(sim["export_df"]), sim["n_target"])

    def test_single_customer_prediction(self):
        res_model = engine.train_conversion_model(self.df)
        query = {
            "age": 35,
            "income": 60000,
            "past_spend": 4500,
            "website_visits": 10,
            "email_open_rate": 0.85,
            "days_since_last_purchase": 5
        }
        prob, pred = engine.predict_single_customer(res_model["pipeline"], query)
        self.assertGreaterEqual(prob, 0.0)
        self.assertLessEqual(prob, 1.0)
        self.assertIn(pred, [0, 1])

if __name__ == "__main__":
    unittest.main()
