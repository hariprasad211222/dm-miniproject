import unittest
from pathlib import Path
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

    def test_sample_business_data_file(self):
        sample_path = Path(__file__).resolve().parent / "sample_business_data.csv"
        self.assertTrue(sample_path.exists(), "sample_business_data.csv must exist")
        df_sample = pd.read_csv(sample_path)
        self.assertGreater(len(df_sample), 0)
        for col in engine.FEATURES + ["converted", "customer_id"]:
            self.assertIn(col, df_sample.columns)

    def test_segmentation_default(self):
        segmented_df, summary = engine.perform_segmentation(self.df, n_clusters=4)
        self.assertEqual(len(segmented_df), 300)
        self.assertIn("persona", segmented_df.columns)
        self.assertEqual(len(summary), 4)
        self.assertTrue(any("High-Value" in p for p in summary["persona"]))

    def test_segmentation_variable_k(self):
        for k in [2, 3, 5, 6]:
            segmented_df, summary = engine.perform_segmentation(self.df, n_clusters=k)
            self.assertEqual(len(segmented_df), 300)
            self.assertEqual(len(summary), k)
            self.assertEqual(len(segmented_df["persona"].unique()), k)

    def test_segmentation_missing_customer_id(self):
        df_no_id = self.df.drop(columns=["customer_id"])
        segmented_df, summary = engine.perform_segmentation(df_no_id, n_clusters=4)
        self.assertIn("customer_id", segmented_df.columns)
        self.assertEqual(len(summary), 4)

    def test_segmentation_with_nulls(self):
        df_nulls = self.df.copy()
        df_nulls.loc[0:5, "past_spend"] = np.nan
        segmented_df, summary = engine.perform_segmentation(df_nulls, n_clusters=4)
        self.assertEqual(len(segmented_df), 300)

    def test_conversion_model_logistic(self):
        res = engine.train_conversion_model(self.df, model_type="Logistic Regression")
        self.assertGreater(res["accuracy"], 0.5)
        self.assertGreater(res["roc_auc"], 0.5)
        self.assertEqual(len(res["probabilities"]), len(self.df))
        self.assertEqual(res["confusion_matrix"].shape, (2, 2))

    def test_conversion_model_random_forest(self):
        res = engine.train_conversion_model(self.df, model_type="Random Forest")
        self.assertGreater(res["accuracy"], 0.5)
        self.assertGreater(res["roc_auc"], 0.5)
        self.assertEqual(res["confusion_matrix"].shape, (2, 2))

    def test_campaign_simulation(self):
        res_model = engine.train_conversion_model(self.df)
        sim = engine.simulate_campaign(self.df, res_model["probabilities"], top_pct=30)
        self.assertEqual(sim["n_target"], round(len(self.df) * 0.3))
        self.assertGreaterEqual(sim["targeted_rate"], sim["baseline_rate"])
        self.assertGreater(sim["savings"], 0)
        self.assertIn("profit_uplift", sim)
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
