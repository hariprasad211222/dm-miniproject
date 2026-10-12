import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
from sklearn.model_selection import cross_val_predict, StratifiedKFold
from sklearn.metrics import accuracy_score, precision_score, recall_score, roc_auc_score, confusion_matrix

FEATURES = ["age", "income", "past_spend", "website_visits", "email_open_rate", "days_since_last_purchase"]
CLUSTER_FEATURES = ["income", "past_spend", "website_visits", "email_open_rate"]

FEATURE_LABELS = {
    "age": "Age",
    "income": "Annual Income ($)",
    "past_spend": "Total Past Spend ($)",
    "website_visits": "Website Visits",
    "email_open_rate": "Email Open Rate (0-1)",
    "days_since_last_purchase": "Recency (Days Since Last Purchase)",
}

def generate_marketing_data(n_samples: int = 600, random_state: int = 42) -> pd.DataFrame:
    """Generate realistic marketing audience dataset with ground truth behaviors."""
    rng = np.random.RandomState(random_state)
    
    # Customer characteristics
    age = rng.randint(20, 68, n_samples)
    income = np.clip(rng.normal(52000, 18000, n_samples), 12000, 140000).round(-2)
    past_spend = np.clip(rng.exponential(2800, n_samples), 10, 18000).round(2)
    website_visits = rng.poisson(6, n_samples)
    email_open_rate = np.clip(rng.normal(0.38, 0.16, n_samples), 0.02, 0.98).round(2)
    days_since_last_purchase = rng.randint(2, 210, n_samples)
    
    # Conversion probability formula grounded in true marketing mechanics
    score = (
        0.35 * (email_open_rate / 0.5)
        + 0.30 * (past_spend / 3000)
        + 0.20 * (website_visits / 8)
        - 0.35 * (days_since_last_purchase / 100)
        + 0.10 * (income / 50000)
        + rng.normal(0, 0.45, n_samples)
    )
    
    # Probability conversion via sigmoid
    prob = 1 / (1 + np.exp(-score))
    converted = (rng.uniform(0, 1, n_samples) < prob).astype(int)
    
    # Ensure balanced enough classes
    if converted.sum() < 25 or (n_samples - converted.sum()) < 25:
        converted = (prob > np.median(prob)).astype(int)
        
    df = pd.DataFrame({
        "customer_id": [f"CUST-{1000 + i}" for i in range(n_samples)],
        "age": age,
        "income": income,
        "past_spend": past_spend,
        "website_visits": website_visits,
        "email_open_rate": email_open_rate,
        "days_since_last_purchase": days_since_last_purchase,
        "converted": converted
    })
    return df

def perform_segmentation(df: pd.DataFrame, n_clusters: int = 4, random_state: int = 42) -> tuple[pd.DataFrame, pd.DataFrame]:
    """Segment customers using K-Means and compute interpretable personas."""
    scaler = StandardScaler()
    scaled_feats = scaler.fit_transform(df[CLUSTER_FEATURES])
    
    kmeans = KMeans(n_clusters=n_clusters, random_state=random_state, n_init=10)
    cluster_labels = kmeans.fit_predict(scaled_feats)
    
    out_df = df.copy()
    out_df["cluster"] = cluster_labels
    
    # Aggregate stats per cluster
    summary = out_df.groupby("cluster").agg(
        customers=("customer_id", "count"),
        avg_income=("income", "mean"),
        avg_spend=("past_spend", "mean"),
        avg_visits=("website_visits", "mean"),
        avg_email_open=("email_open_rate", "mean"),
        conversion_rate=("converted", "mean")
    ).reset_index()
    
    # Heuristic persona labelling based on highest relative strengths
    personas = {}
    remaining_clusters = list(summary["cluster"])
    
    # 1. VIP Loyalists: highest spend
    top_spend = summary.loc[summary["cluster"].isin(remaining_clusters), "avg_spend"].idxmax()
    c_vip = summary.loc[top_spend, "cluster"]
    personas[c_vip] = "⭐ High-Value Loyalists"
    remaining_clusters.remove(c_vip)
    
    # 2. Window Shoppers: highest web visits among remaining
    if remaining_clusters:
        top_visits = summary.loc[summary["cluster"].isin(remaining_clusters), "avg_visits"].idxmax()
        c_browse = summary.loc[top_visits, "cluster"]
        personas[c_browse] = "👀 Window Shoppers"
        remaining_clusters.remove(c_browse)
        
    # 3. Disengaged / Churn Risk: lowest email open rate among remaining
    if remaining_clusters:
        low_open = summary.loc[summary["cluster"].isin(remaining_clusters), "avg_email_open"].idxmin()
        c_disengaged = summary.loc[low_open, "cluster"]
        personas[c_disengaged] = "⚠️ Disengaged / At-Risk"
        remaining_clusters.remove(c_disengaged)
        
    # Rest: Steady regular buyers
    for idx, c_rem in enumerate(remaining_clusters, 1):
        personas[c_rem] = f"🌱 Steady Buyers {idx}" if len(remaining_clusters) > 1 else "🌱 Steady Buyers"
        
    out_df["persona"] = out_df["cluster"].map(personas)
    summary["persona"] = summary["cluster"].map(personas)
    
    return out_df, summary.sort_values("avg_spend", ascending=False).reset_index(drop=True)

def train_conversion_model(df: pd.DataFrame, model_type: str = "Logistic Regression", random_state: int = 42) -> dict:
    """Train predictive model with 5-fold Stratified Cross-Validation."""
    X = df[FEATURES]
    y = df["converted"]
    
    if model_type == "Random Forest":
        clf = RandomForestClassifier(n_estimators=100, max_depth=6, random_state=random_state)
        pipeline = make_pipeline(StandardScaler(), clf)
    else:
        clf = LogisticRegression(max_iter=1000, random_state=random_state)
        pipeline = make_pipeline(StandardScaler(), clf)
        
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=random_state)
    probs = cross_val_predict(pipeline, X, y, cv=cv, method="predict_proba")[:, 1]
    preds = (probs >= 0.5).astype(int)
    
    # Fit full model to extract feature weights
    pipeline.fit(X, y)
    
    if model_type == "Random Forest":
        importances = pd.Series(pipeline.named_steps["randomforestclassifier"].feature_importances_, index=FEATURES)
    else:
        importances = pd.Series(pipeline.named_steps["logisticregression"].coef_[0], index=FEATURES)
        
    return {
        "accuracy": float(accuracy_score(y, preds)),
        "precision": float(precision_score(y, preds, zero_division=0)),
        "recall": float(recall_score(y, preds, zero_division=0)),
        "roc_auc": float(roc_auc_score(y, probs)),
        "confusion_matrix": confusion_matrix(y, preds),
        "probabilities": probs,
        "feature_importance": importances.sort_values(ascending=False),
        "pipeline": pipeline,
    }

def simulate_campaign(
    df: pd.DataFrame,
    probs: np.ndarray,
    top_pct: int,
    cost_per_contact: float = 0.15,
    rev_per_conversion: float = 65.0
) -> dict:
    """Simulate mass email blast vs AI high-propensity targeted campaign."""
    n_total = len(df)
    baseline_conversions = int(df["converted"].sum())
    baseline_rate = float(df["converted"].mean())
    
    blast_cost = n_total * cost_per_contact
    blast_revenue = baseline_conversions * rev_per_conversion
    blast_profit = blast_revenue - blast_cost
    blast_roi = (blast_profit / blast_cost * 100) if blast_cost > 0 else 0
    
    # AI selective targeting
    n_target = max(1, int(round(n_total * (top_pct / 100.0))))
    top_indices = np.argsort(-probs)[:n_target]
    
    targeted_subset = df.iloc[top_indices]
    targeted_conversions = int(targeted_subset["converted"].sum())
    targeted_rate = float(targeted_subset["converted"].mean())
    
    targeted_cost = n_target * cost_per_contact
    targeted_revenue = targeted_conversions * rev_per_conversion
    targeted_profit = targeted_revenue - targeted_cost
    targeted_roi = (targeted_profit / targeted_cost * 100) if targeted_cost > 0 else 0
    
    lift = ((targeted_rate - baseline_rate) / baseline_rate * 100) if baseline_rate > 0 else 0
    savings = blast_cost - targeted_cost
    
    # Prepare export dataframe
    export_df = targeted_subset.copy()
    export_df["conversion_probability"] = (probs[top_indices] * 100).round(1)
    
    return {
        "n_total": n_total,
        "n_target": n_target,
        "baseline_rate": baseline_rate,
        "targeted_rate": targeted_rate,
        "lift": lift,
        "blast_cost": blast_cost,
        "blast_revenue": blast_revenue,
        "blast_profit": blast_profit,
        "blast_roi": blast_roi,
        "targeted_cost": targeted_cost,
        "targeted_revenue": targeted_revenue,
        "targeted_profit": targeted_profit,
        "targeted_roi": targeted_roi,
        "savings": savings,
        "export_df": export_df
    }

def predict_single_customer(model_pipeline, customer_data: dict) -> tuple[float, int]:
    """Predict conversion probability and outcome for an interactive customer query."""
    row = pd.DataFrame([customer_data])[FEATURES]
    prob = float(model_pipeline.predict_proba(row)[0, 1])
    pred = int(prob >= 0.5)
    return prob, pred
