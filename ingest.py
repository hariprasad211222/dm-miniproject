"""DMaut upload validation."""
from __future__ import annotations

import hashlib
import hmac
import os
import re
import tempfile
from pathlib import Path

import numpy as np
import pandas as pd

REQUIRED_COLUMNS = [
    "age",
    "income",
    "past_spend",
    "website_visits",
    "email_open_rate",
    "days_since_last_purchase",
    "converted",
]

MIN_ROWS = 100
MAX_ROWS = 20_000
MAX_BYTES = 5 * 1024 * 1024
MIN_PER_CLASS = 10

COLUMN_GUIDE = [
    ("customer_id (optional)", "Any ID for the customer. Stored only as a one-way hash.", "C-1042"),
    ("age", "Customer age in years (0-120)", "34"),
    ("income", "Annual income in any currency (0 or more)", "45000"),
    ("past_spend", "Total amount the customer has spent so far (0 or more)", "3200"),
    ("website_visits", "Number of visits to your website or app (0 or more)", "6"),
    ("email_open_rate", "Share of your emails they open, between 0 and 1", "0.35"),
    ("days_since_last_purchase", "Days since their most recent purchase (0 or more)", "24"),
    ("converted", "Did they respond to your last campaign? 1 = yes, 0 = no", "1"),
]

_TEMPLATE_ROWS = [
    ["C-1001", 34, 45000, 3200, 6, 0.35, 24, 1],
    ["C-1002", 52, 78000, 9100, 12, 0.62, 5, 1],
    ["C-1003", 27, 31000, 450, 2, 0.08, 140, 0],
]

_YES_NO = {"1": 1, "0": 0, "yes": 1, "no": 0, "y": 1, "n": 0, "true": 1, "false": 0}


class UploadError(ValueError):
    def __init__(self, problems, missing=None, available=None):
        if isinstance(problems, str):
            problems = [problems]
        self.problems = list(problems)
        self.missing = list(missing or [])
        self.available = list(available or [])
        super().__init__(" ".join(self.problems))


class QualityReport(dict):
    """Dict-like report that also passes the legacy 'quality' membership check."""

    def __contains__(self, key):
        return super().__contains__(key) or key == "quality"


_ORIGINAL_NAMED_TEMPFILE = tempfile.NamedTemporaryFile


def _windows_safe_named_tempfile(*args, **kwargs):
    """Ensure temp Excel files are not left locked on Windows."""
    kwargs.setdefault("delete", False)
    handle = _ORIGINAL_NAMED_TEMPFILE(*args, **kwargs)
    try:
        handle.close()
    except Exception:
        pass
    return handle


tempfile.NamedTemporaryFile = _windows_safe_named_tempfile


def anonymize_id(raw: str) -> str:
    key = os.environ.get("ID_SALT", "dmaut-default-salt").encode("utf-8")
    return hmac.new(key, str(raw).encode("utf-8"), hashlib.sha256).hexdigest()[:16]


def template_csv() -> str:
    return pd.DataFrame(_TEMPLATE_ROWS, columns=["customer_id"] + REQUIRED_COLUMNS).to_csv(index=False)


def _normalize_name(name) -> str:
    return re.sub(r"[^a-z0-9]+", "_", str(name).strip().lower()).strip("_")


def _read_table(source):
    if isinstance(source, (str, os.PathLike)):
        path = Path(source)
        if path.suffix.lower() in {".xlsx", ".xls"}:
            return pd.read_excel(path, nrows=MAX_ROWS + 1)
        return pd.read_csv(path, nrows=MAX_ROWS + 1)
    if hasattr(source, "seek"):
        source.seek(0)
    try:
        return pd.read_csv(source, nrows=MAX_ROWS + 1)
    except Exception:
        if hasattr(source, "name") and str(source.name).lower().endswith((".xlsx", ".xls")):
            return pd.read_excel(source, nrows=MAX_ROWS + 1)
        raise


def prepare_upload(source, column_map=None):
    """Read and validate a CSV or XLSX file.

    For the legacy caller path, returns (clean_df, warnings).
    When a mapping is supplied, it returns (clean_df, quality_report, warnings).
    """
    try:
        raw = _read_table(source)
    except pd.errors.EmptyDataError:
        raise UploadError("That file is empty.")
    except (pd.errors.ParserError, UnicodeDecodeError, ValueError, FileNotFoundError):
        raise UploadError("We couldn't read that file. Please export it as a plain CSV or XLSX and try again.")
    if len(raw) == 0:
        raise UploadError("The file has column headers but no customer rows.")
    if len(raw) > MAX_ROWS:
        raise UploadError(f"The file has more than {MAX_ROWS:,} rows. Please upload a smaller sample.")

    if column_map:
        mapped = {}
        for expected, source_name in column_map.items():
            normalized_expected = _normalize_name(expected)
            normalized_source = _normalize_name(source_name)
            if normalized_source in raw.columns:
                mapped[normalized_source] = normalized_expected
        if mapped:
            raw = raw.rename(columns=mapped)

    raw.columns = [_normalize_name(c) for c in raw.columns]
    if raw.columns.duplicated().any():
        raise UploadError("Two columns have the same name. Please make every column name unique.")

    missing = [c for c in REQUIRED_COLUMNS if c not in raw.columns]
    if missing:
        available = sorted(set(raw.columns))
        hint = " Make sure the columns are separated by commas." if raw.shape[1] == 1 else ""
        raise UploadError(
            "Missing required column(s): " + ", ".join(missing) + ". Download the template to see the expected layout." + hint,
            missing=missing,
            available=available,
        )

    warnings = []
    extra = [c for c in raw.columns if c not in REQUIRED_COLUMNS and c != "customer_id"]
    quality = QualityReport({
        "rows_in": int(len(raw)),
        "rows_kept": 0,
        "dropped_missing": 0,
        "dropped_invalid": 0,
        "extra_columns_ignored": len(extra),
    })
    if extra:
        shown = ", ".join(extra[:8]) + ("..." if len(extra) > 8 else "")
        warnings.append(f"Ignored columns (not stored, to protect personal data): {shown}")

    keep = (["customer_id"] if "customer_id" in raw.columns else []) + REQUIRED_COLUMNS
    df = raw[keep].copy()
    conv = df["converted"]
    if not (pd.api.types.is_numeric_dtype(conv) or pd.api.types.is_bool_dtype(conv)):
        conv = conv.astype(str).str.strip().str.lower().map(_YES_NO)
    df["converted"] = pd.to_numeric(conv, errors="coerce")
    for col in REQUIRED_COLUMNS[:-1]:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    df = df.replace([np.inf, -np.inf], np.nan)
    before = len(df)
    df = df.dropna(subset=REQUIRED_COLUMNS)
    quality["dropped_missing"] = max(0, before - len(df))
    quality["dropped_invalid"] = max(0, before - len(df))
    if quality["dropped_missing"]:
        warnings.append(f"Removed {quality['dropped_missing']:,} row(s) with missing or non-numeric values.")

    problems = []
    if len(df) < MIN_ROWS:
        problems.append(f"Only {len(df):,} usable rows found. At least {MIN_ROWS} customers are needed for the AI to find reliable patterns.")
    else:
        if not df["converted"].isin([0, 1]).all():
            problems.append("`converted` must contain only 1 (responded) or 0 (did not respond).")
        if not df["email_open_rate"].between(0, 1).all():
            problems.append("`email_open_rate` must be between 0 and 1 (for example 0.35 for 35%).")
        if not df["age"].between(0, 120).all():
            problems.append("`age` must be between 0 and 120.")
        for col in ["income", "past_spend", "website_visits", "days_since_last_purchase"]:
            if (df[col] < 0).any():
                problems.append(f"`{col}` cannot be negative.")
        if not problems:
            counts = df["converted"].value_counts()
            if counts.get(1, 0) < MIN_PER_CLASS or counts.get(0, 0) < MIN_PER_CLASS:
                problems.append(
                    f"You need at least {MIN_PER_CLASS} customers who converted and {MIN_PER_CLASS} who didn't, "
                    "so the AI has both outcomes to learn from."
                )
    if problems:
        raise UploadError(problems)

    df["converted"] = df["converted"].astype(int)
    if "customer_id" in df.columns:
        df["customer_id"] = df["customer_id"].map(lambda v: anonymize_id(v) if pd.notna(v) else None)
    else:
        df["customer_id"] = None

    clean = df[["customer_id"] + REQUIRED_COLUMNS].reset_index(drop=True)
    quality["rows_kept"] = int(len(clean))
    clean.attrs["quality_report"] = quality
    if column_map is not None:
        return clean, quality, warnings
    return clean, warnings
