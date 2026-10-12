"""DMaut analysis: the machine-learning steps, kept separate from the UI."""
from __future__ import annotations

from dataclasses import dataclass

import hashlib
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, confusion_matrix, precision_score, recall_score, roc_auc_score
from sklearn.model_selection import StratifiedKFold, cross_val_predict
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

SEGMENT_FEATURES = ["income", "past_spend", "website_visits", "email_open_rate"]
MODEL_FEATURES = ["age", "income", "past_spend", "website_visits", "email_open_rate", "days_since_last_purchase"]

FRIENDLY_NAMES = {
    "age": "age",
    "income": "income",
    "past_spend": "past spend",
    "website_visits": "number of website visits",
    "email_open_rate": "email open rate",
    "days_since_last_purchase": "number of days since the last purchase",
}


@dataclass
class ModelResult:
    accuracy: float
    precision: float
    recall: float
    roc_auc: float
    confusion: np.ndarray
    coefficients: pd.Series
    proba: np.ndarray


@dataclass
class OptimizationResult:
    baseline_rate: float
    targeted_rate: float
    lift: float
    n_targeted: int
    n_total: int


def _name_segments(profile: pd.DataFrame) -> dict:
    remaining = list(profile.index)
    labels = {}

    def take(label, column, largest):
        if not remaining:
            return
        values = profile.loc[remaining, column]
        pick = values.idxmax() if largest else values.idxmin()
        labels[pick] = label
        remaining.remove(pick)

    take("High-Value Loyalists", "past_spend", largest=True)
    take("Disengaged / At-Risk", "email_open_rate", largest=False)
    take("Browsers / Window Shoppers", "website_visits", largest=True)
    for number, seg in enumerate(remaining, start=1):
        labels[seg] = "Steady Regulars" if len(remaining) == 1 else f"Steady Regulars {number}"
    return labels


def segment_customers(df: pd.DataFrame, n_clusters: int, seed: int = 42):
    scaled = StandardScaler().fit_transform(df[SEGMENT_FEATURES])
    ids = KMeans(n_clusters=n_clusters, random_state=seed, n_init=10).fit_predict(scaled)

    out = df.copy()
    out["segment"] = ids
    profile = out.groupby("segment").agg(
        income=("income", "mean"),
        past_spend=("past_spend", "mean"),
        website_visits=("website_visits", "mean"),
        email_open_rate=("email_open_rate", "mean"),
        conversion_rate=("converted", "mean"),
        customers=("converted", "size"),
    )
    labels = _name_segments(profile)
    out["segment_label"] = out["segment"].map(labels)
    profile.index = profile.index.map(labels)
    profile.index.name = "segment"
    return out, profile.sort_values("past_spend", ascending=False)


def evaluate_model(df: pd.DataFrame, seed: int = 42) -> ModelResult:
    X, y = df[MODEL_FEATURES], df["converted"]
    pipeline = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000))
    n_splits = int(max(2, min(5, y.value_counts().min())))
    cv = StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=seed)
    proba = cross_val_predict(pipeline, X, y, cv=cv, method="predict_proba")[:, 1]
    predicted = (proba >= 0.5).astype(int)

    pipeline.fit(X, y)
    coefs = pd.Series(pipeline[-1].coef_[0], index=MODEL_FEATURES)
    return ModelResult(
        accuracy=float(accuracy_score(y, predicted)),
        precision=float(precision_score(y, predicted, zero_division=0)),
        recall=float(recall_score(y, predicted, zero_division=0)),
        roc_auc=float(roc_auc_score(y, proba)),
        confusion=confusion_matrix(y, predicted),
        coefficients=coefs.reindex(coefs.abs().sort_values(ascending=False).index),
        proba=proba,
    )


def compare_models(df: pd.DataFrame, seed: int = 42) -> pd.DataFrame:
    X, y = df[MODEL_FEATURES], df["converted"]
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=seed)
    lr = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000))
    rf = RandomForestClassifier(n_estimators=200, min_samples_leaf=5, random_state=seed)

    lr_proba = cross_val_predict(lr, X, y, cv=cv, method="predict_proba")[:, 1]
    rf_proba = cross_val_predict(rf, X, y, cv=cv, method="predict_proba")[:, 1]

    rows = [
        {
            "model": "Logistic Regression",
            "accuracy": accuracy_score(y, (lr_proba >= 0.5).astype(int)),
            "precision": precision_score(y, (lr_proba >= 0.5).astype(int), zero_division=0),
            "recall": recall_score(y, (lr_proba >= 0.5).astype(int), zero_division=0),
            "roc_auc": roc_auc_score(y, lr_proba),
        },
        {
            "model": "Random Forest",
            "accuracy": accuracy_score(y, (rf_proba >= 0.5).astype(int)),
            "precision": precision_score(y, (rf_proba >= 0.5).astype(int), zero_division=0),
            "recall": recall_score(y, (rf_proba >= 0.5).astype(int), zero_division=0),
            "roc_auc": roc_auc_score(y, rf_proba),
        },
    ]
    return pd.DataFrame(rows).sort_values("roc_auc", ascending=False).reset_index(drop=True)


def optimize_targeting(df: pd.DataFrame, proba: np.ndarray, target_pct: int) -> OptimizationResult:
    y = df["converted"].to_numpy()
    baseline = float(y.mean())
    n_targeted = int(min(len(y), max(1, round(len(y) * target_pct / 100))))
    top = np.argsort(-proba, kind="stable")[:n_targeted]
    targeted = float(y[top].mean())
    lift = (targeted - baseline) / baseline if baseline > 0 else 0.0
    return OptimizationResult(baseline, targeted, lift, n_targeted, len(y))


def targeted_customer_table(df: pd.DataFrame, proba: np.ndarray, target_pct: int) -> pd.DataFrame:
    n_targeted = int(min(len(df), max(1, round(len(df) * target_pct / 100))))
    top_idx = np.argsort(-proba, kind="stable")[:n_targeted]
    out = df.iloc[top_idx].copy()
    out["customer_id_hash"] = out.get("customer_id", pd.Series([None] * len(out))).map(lambda x: hashlib.sha256(str(x).encode("utf-8")).hexdigest()[:16] if pd.notna(x) else None)
    out["segment"] = out["segment_label"] if "segment_label" in out.columns else "segment"
    out["probability"] = proba[top_idx]
    return out[["customer_id_hash", "segment", "probability"]].sort_values("probability", ascending=False).reset_index(drop=True)


def plain_english_drivers(coefs: pd.Series) -> str:
    parts = []
    positive, negative = coefs[coefs > 0], coefs[coefs < 0]
    if len(positive):
        parts.append(f"customers with a higher **{FRIENDLY_NAMES[positive.idxmax()]}** are more likely to convert")
    if len(negative):
        parts.append(f"a higher **{FRIENDLY_NAMES[negative.idxmin()]}** makes conversion less likely")
    return ("In your data, " + ", while ".join(parts) + ".") if parts else ""
