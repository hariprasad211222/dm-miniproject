"""
Run with:  python -m unittest -v

Covers: separate admin/user databases, password hashing and lockout, dataset
isolation between accounts, upload validation, the ML analysis, and a smoke
test of the real Streamlit app (login flow for both roles).
"""
import io
import os
import shutil
import sqlite3
import tempfile
import unittest
from pathlib import Path

import numpy as np
import pandas as pd

os.environ["DMAUT_SKIP_THEME_CHECK"] = "1"
os.environ.pop("DMAUT_MODE", None)

import analysis
import db
import ingest

db.PBKDF2_ITERATIONS = 1_000  # fast hashing for tests only; production uses 600,000
APP_PATH = Path(__file__).resolve().parent / "app.py"


def make_raw_df(n=300, seed=0):
    """Test-only sample data with a real signal to learn."""
    rng = np.random.RandomState(seed)
    email = np.clip(rng.normal(0.35, 0.15, n), 0, 1)
    recency = rng.randint(1, 180, n)
    spend = rng.exponential(3000, n)
    visits = rng.poisson(5, n)
    score = 0.4 * email + 0.25 * spend / spend.max() + 0.2 * visits / visits.max() - 0.3 * recency / 180 + rng.normal(0, 0.1, n)
    return pd.DataFrame({
        "customer_id": [f"c{i}@example.com" for i in range(n)],
        "age": rng.randint(18, 60, n),
        "income": rng.normal(45000, 15000, n).clip(10000, 120000).round(0),
        "past_spend": spend.round(2),
        "website_visits": visits,
        "email_open_rate": email.round(2),
        "days_since_last_purchase": recency,
        "converted": (score > np.percentile(score, 55)).astype(int),
    })


def csv_of(df):
    return io.BytesIO(df.to_csv(index=False).encode())


class TempDataDir(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp()
        os.environ["DMAUT_DATA_DIR"] = self.tmp
        db.init_db()

    def tearDown(self):
        shutil.rmtree(self.tmp, ignore_errors=True)


class TestAccounts(TempDataDir):
    def test_two_separate_database_files(self):
        self.assertTrue((Path(self.tmp) / "admin.db").exists())
        self.assertTrue((Path(self.tmp) / "user.db").exists())

    def test_login_success_and_failure(self):
        db.create_account("user", "alice", "correct-horse")
        self.assertIsNotNone(db.authenticate("user", "alice", "correct-horse")[0])
        self.assertIsNone(db.authenticate("user", "alice", "wrong-password")[0])
        self.assertIsNone(db.authenticate("user", "nobody", "correct-horse")[0])

    def test_username_is_case_insensitive_and_unique(self):
        db.create_account("user", "Alice", "correct-horse")
        with self.assertRaises(ValueError):
            db.create_account("user", "alice", "another-pass1")

    def test_rejects_weak_input(self):
        with self.assertRaises(ValueError):
            db.create_account("user", "ab", "correct-horse")
        with self.assertRaises(ValueError):
            db.create_account("user", "alice", "short")
        with self.assertRaises(ValueError):
            db.create_account("user", "bad name!", "correct-horse")

    def test_password_is_not_stored_in_plain_text(self):
        db.create_account("user", "alice", "correct-horse")
        with sqlite3.connect(Path(self.tmp) / "user.db") as conn:
            stored = " ".join(str(v) for row in conn.execute("SELECT * FROM accounts") for v in row)
        self.assertNotIn("correct-horse", stored)

    def test_admin_and_user_accounts_are_isolated(self):
        db.create_account("user", "alice", "correct-horse")
        self.assertIsNone(db.authenticate("admin", "alice", "correct-horse")[0])
        self.assertFalse(db.account_exists("admin"))

    def test_lockout_after_repeated_failures(self):
        db.create_account("user", "alice", "correct-horse")
        for _ in range(db.MAX_FAILED_ATTEMPTS):
            db.authenticate("user", "alice", "nope-nope-nope")
        account_id, message = db.authenticate("user", "alice", "correct-horse")
        self.assertIsNone(account_id)
        self.assertIn("Too many failed attempts", message)


class TestDatasets(TempDataDir):
    def setUp(self):
        super().setUp()
        self.clean, _ = ingest.prepare_upload(csv_of(make_raw_df()))
        self.alice = db.create_account("user", "alice", "correct-horse")
        self.bob = db.create_account("user", "bob", "correct-horse")

    def test_round_trip(self):
        dataset_id = db.save_dataset("user", self.alice, "March list", self.clean)
        loaded = db.load_dataset("user", self.alice, dataset_id)
        self.assertEqual(len(loaded), len(self.clean))
        self.assertEqual(int(loaded["converted"].sum()), int(self.clean["converted"].sum()))

    def test_other_users_cannot_read_or_delete(self):
        dataset_id = db.save_dataset("user", self.alice, "Private", self.clean)
        self.assertIsNone(db.load_dataset("user", self.bob, dataset_id))
        self.assertFalse(db.delete_dataset("user", self.bob, dataset_id))
        self.assertEqual(db.list_datasets("user", self.bob), [])
        self.assertIsNotNone(db.load_dataset("user", self.alice, dataset_id))

    def test_delete_removes_customer_rows(self):
        dataset_id = db.save_dataset("user", self.alice, "Temp", self.clean)
        self.assertTrue(db.delete_dataset("user", self.alice, dataset_id))
        with sqlite3.connect(Path(self.tmp) / "user.db") as conn:
            self.assertEqual(conn.execute("SELECT COUNT(*) FROM customers").fetchone()[0], 0)

    def test_dataset_limit(self):
        for i in range(db.MAX_DATASETS_PER_ACCOUNT):
            db.save_dataset("user", self.alice, f"set {i}", self.clean)
        with self.assertRaises(ValueError):
            db.save_dataset("user", self.alice, "one too many", self.clean)

    def test_admin_overview_has_no_customer_rows(self):
        db.save_dataset("user", self.alice, "Private", self.clean)
        db.log_event("alice", "user", "upload", "300 rows")
        users, events = db.admin_overview()
        alice = next(u for u in users if u["username"] == "alice")
        self.assertEqual(alice["datasets"], 1)
        self.assertEqual(alice["customers"], len(self.clean))
        self.assertNotIn("age", alice)
        self.assertEqual(events[0]["action"], "upload")

    def test_admin_data_lives_in_the_admin_database(self):
        admin_id = db.create_account("admin", "boss", "correct-horse")
        dataset_id = db.save_dataset("admin", admin_id, "Admin list", self.clean)
        self.assertIsNotNone(db.load_dataset("admin", admin_id, dataset_id))
        with sqlite3.connect(Path(self.tmp) / "user.db") as conn:
            self.assertEqual(conn.execute("SELECT COUNT(*) FROM datasets").fetchone()[0], 0)


class TestIngest(unittest.TestCase):
    def test_valid_file_is_cleaned_and_ids_are_hashed(self):
        clean, warnings = ingest.prepare_upload(csv_of(make_raw_df()))
        self.assertEqual(len(clean), 300)
        self.assertFalse(clean["customer_id"].str.contains("@").any())
        self.assertEqual(warnings, [])

    def test_prepare_upload_accepts_column_mapping_and_quality_report(self):
        raw = make_raw_df().rename(columns={"email_open_rate": "open_rate", "days_since_last_purchase": "days_since"})
        clean, quality, warnings = ingest.prepare_upload(csv_of(raw), column_map={"email_open_rate": "open_rate", "days_since_last_purchase": "days_since"})
        self.assertIn("quality", quality)
        self.assertGreaterEqual(quality["rows_in"], 300)
        self.assertNotIn("open_rate", clean.columns)
        self.assertEqual(clean.columns[0], "customer_id")
        self.assertTrue(isinstance(warnings, list))

    def test_xlsx_upload_supports_openpyxl(self):
        raw = make_raw_df(n=120)
        temp = tempfile.NamedTemporaryFile(suffix=".xlsx", delete=False)
        try:
            raw.to_excel(temp.name, index=False)
            clean, _, _ = ingest.prepare_upload(temp.name)
            self.assertEqual(len(clean), 120)
        finally:
            os.unlink(temp.name)

    def test_extra_personal_columns_are_dropped_with_warning(self):
        raw = make_raw_df()
        raw["email"] = "someone@example.com"
        raw["full name"] = "Jane Doe"
        clean, warnings = ingest.prepare_upload(csv_of(raw))
        self.assertNotIn("email", clean.columns)
        self.assertNotIn("full_name", clean.columns)
        self.assertTrue(any("Ignored columns" in w for w in warnings))

    def test_missing_id_column_is_fine(self):
        clean, _ = ingest.prepare_upload(csv_of(make_raw_df().drop(columns=["customer_id"])))
        self.assertEqual(len(clean), 300)

    def test_messy_headers_and_yes_no_values(self):
        raw = make_raw_df().rename(columns={"past_spend": " Past Spend ", "converted": "Converted"})
        raw["Converted"] = raw["Converted"].map({1: "Yes", 0: "No"})
        clean, _ = ingest.prepare_upload(csv_of(raw))
        self.assertEqual(set(clean["converted"].unique()), {0, 1})

    def assert_rejected(self, raw, fragment):
        with self.assertRaises(ingest.UploadError) as ctx:
            ingest.prepare_upload(csv_of(raw))
        self.assertIn(fragment, " ".join(ctx.exception.problems))

    def test_rejections(self):
        self.assert_rejected(make_raw_df().drop(columns=["income"]), "Missing required column")
        self.assert_rejected(make_raw_df(n=50), "usable rows")
        bad = make_raw_df(); bad.loc[0, "income"] = -5
        self.assert_rejected(bad, "cannot be negative")
        bad = make_raw_df(); bad.loc[0, "email_open_rate"] = 35
        self.assert_rejected(bad, "between 0 and 1")
        bad = make_raw_df(); bad["converted"] = 0
        self.assert_rejected(bad, "who converted")
        bad = make_raw_df(); bad.loc[0, "converted"] = 2
        self.assert_rejected(bad, "only 1")

    def test_garbage_and_empty_files(self):
        with self.assertRaises(ingest.UploadError):
            ingest.prepare_upload(io.BytesIO(b""))
        with self.assertRaises(ingest.UploadError):
            ingest.prepare_upload(io.BytesIO(b"a,b\n"))

    def test_template_itself_has_the_right_columns(self):
        header = ingest.template_csv().splitlines()[0].split(",")
        self.assertEqual(header, ["customer_id"] + ingest.REQUIRED_COLUMNS)


class TestAnalysis(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.df, _ = ingest.prepare_upload(csv_of(make_raw_df(n=600)))

    def test_segments_have_unique_names(self):
        for k in range(2, 7):
            seg_df, profile = analysis.segment_customers(self.df, k)
            self.assertEqual(len(profile), k)
            self.assertEqual(profile.index.nunique(), k)
            self.assertEqual(int(profile["customers"].sum()), len(self.df))
            self.assertEqual(seg_df["segment_label"].nunique(), k)

    def test_model_learns_the_signal(self):
        model = analysis.evaluate_model(self.df)
        self.assertGreater(model.accuracy, 0.65)
        self.assertEqual(int(model.confusion.sum()), len(self.df))
        self.assertTrue(((model.proba >= 0) & (model.proba <= 1)).all())
        self.assertGreater(model.coefficients["email_open_rate"], 0)
        self.assertLess(model.coefficients["days_since_last_purchase"], 0)

    def test_targeting_beats_mass_campaign(self):
        model = analysis.evaluate_model(self.df)
        opt = analysis.optimize_targeting(self.df, model.proba, 40)
        self.assertEqual(opt.n_targeted, round(len(self.df) * 0.4))
        self.assertGreater(opt.targeted_rate, opt.baseline_rate)
        self.assertGreater(opt.lift, 0)
        everyone = analysis.optimize_targeting(self.df, model.proba, 100)
        self.assertAlmostEqual(everyone.targeted_rate, everyone.baseline_rate)

    def test_plain_english_sentence(self):
        model = analysis.evaluate_model(self.df)
        text = analysis.plain_english_drivers(model.coefficients)
        self.assertIn("email open rate", text)


try:
    from streamlit.testing.v1 import AppTest
except ImportError:  # very old Streamlit
    AppTest = None


@unittest.skipIf(AppTest is None, "Streamlit AppTest is not available")
class TestApp(TempDataDir):
    def new_app(self):
        return AppTest.from_file(str(APP_PATH), default_timeout=90)

    def login(self, at, role, username, password):
        at.run()
        if role == "admin":
            at.radio(key="role_choice").set_value("🔑 Admin").run()
        at.text_input(key=f"login_user_{role}").set_value(username)
        at.text_input(key=f"login_pw_{role}").set_value(password)
        at.button(key=f"login_submit_{role}").click().run()
        return at

    def test_login_page_renders(self):
        at = self.new_app().run()
        self.assertFalse(at.exception)
        self.assertFalse(at.session_state["authenticated"] if "authenticated" in at.session_state else False)

    def test_wrong_password_shows_error(self):
        db.create_account("user", "alice", "correct-horse")
        at = self.login(self.new_app(), "user", "alice", "wrong-password")
        self.assertFalse(at.exception)
        self.assertTrue(any("Incorrect" in e.value for e in at.error))

    def test_user_with_no_data_sees_guided_empty_state(self):
        db.create_account("user", "alice", "correct-horse")
        at = self.login(self.new_app(), "user", "alice", "correct-horse")
        self.assertFalse(at.exception)
        self.assertEqual(at.session_state["role"], "user")
        labels = [t.label for t in at.tabs]
        self.assertTrue(any("MY DATA" in l for l in labels))
        self.assertFalse(any("ADMIN PANEL" in l for l in labels))

    def test_user_with_data_sees_results(self):
        account_id = db.create_account("user", "alice", "correct-horse")
        clean, _ = ingest.prepare_upload(csv_of(make_raw_df(n=400)))
        db.save_dataset("user", account_id, "Demo list", clean)
        at = self.login(self.new_app(), "user", "alice", "correct-horse")
        self.assertFalse(at.exception)
        metric_labels = [m.label for m in at.metric]
        self.assertIn("Model accuracy", metric_labels)
        self.assertIn("Email everyone", metric_labels)
        self.assertFalse(any("Nothing to show yet" in m.value for m in at.markdown))
        self.assertEqual(len(at.sidebar.slider), 1)  # users only get the targeting slider

    def test_admin_sees_admin_panel_and_extra_slider(self):
        db.create_account("admin", "boss", "correct-horse")
        at = self.login(self.new_app(), "admin", "boss", "correct-horse")
        self.assertFalse(at.exception)
        self.assertTrue(any("ADMIN PANEL" in t.label for t in at.tabs))
        self.assertEqual(len(at.sidebar.slider), 2)


if __name__ == "__main__":
    unittest.main()
