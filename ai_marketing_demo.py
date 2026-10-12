"""
AI-Enabled Marketing Automation and Campaign Optimization
-----------------------------------------------------------
Mini Project Demo Script

This script demonstrates two core AI techniques used in modern
marketing automation platforms (e.g. the kind used internally by
Flipkart, Myntra, Swiggy for campaign targeting):

1. CUSTOMER SEGMENTATION using K-Means clustering
   -> Groups customers by behaviour so campaigns can be personalized
      instead of "one-size-fits-all" blasts.

2. CAMPAIGN CONVERSION PREDICTION using Logistic Regression
   -> Predicts which customers are likely to respond to a campaign,
      so marketing spend/emails/ads are targeted only at high-probability
      responders (this is "campaign optimization").

A synthetic dataset is generated to simulate a real marketing database
(customer age, income, past spend, website visits, email open rate,
time since last purchase, and whether they converted on the last campaign).
"""

import hashlib
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report

np.random.seed(42)


def anonymize_id(raw_id: str, salt: str = "campaign-2026") -> str:
    """
    Hashes a customer identifier (e.g. email or phone) into a one-way,
    non-reversible token before it's used anywhere in the pipeline.

    Real marketing databases contain PII (name, email, phone). The model
    only ever needs a *stable* identifier to join predictions back to a
    customer record for the actual email/SMS send step — it never needs
    the PII itself. Salting + SHA-256 means even if this dataset leaked,
    the raw identifiers can't be recovered from the hashes.
    """
    return hashlib.sha256((raw_id + salt).encode()).hexdigest()[:16]

# ----------------------------------------------------------------------
# 1. SIMULATE A CUSTOMER / CAMPAIGN DATASET
# ----------------------------------------------------------------------
N = 600

age = np.random.randint(18, 60, N)
income = np.random.normal(45000, 15000, N).clip(10000, 120000)
past_spend = np.random.exponential(3000, N)
website_visits = np.random.poisson(5, N)
email_open_rate = np.clip(np.random.normal(0.35, 0.15, N), 0, 1)
days_since_last_purchase = np.random.randint(1, 180, N)

# Conversion probability is engineered to depend on real signals
# (higher engagement + recent purchase + higher spend -> more likely to convert)
conversion_score = (
    0.4 * email_open_rate
    + 0.25 * (past_spend / past_spend.max())
    + 0.2 * (website_visits / website_visits.max())
    - 0.3 * (days_since_last_purchase / 180)
    + np.random.normal(0, 0.1, N)
)
converted = (conversion_score > np.percentile(conversion_score, 55)).astype(int)

# Simulate a raw PII identifier (e.g. what a real CRM export would contain),
# then immediately hash it — the raw value is never stored or written to disk.
raw_customer_emails = [f"customer{i}@example.com" for i in range(N)]
customer_id = [anonymize_id(e) for e in raw_customer_emails]

df = pd.DataFrame({
    "customer_id": customer_id,   # anonymized — safe to store/export
    "age": age,
    "income": income.round(0),
    "past_spend": past_spend.round(2),
    "website_visits": website_visits,
    "email_open_rate": email_open_rate.round(2),
    "days_since_last_purchase": days_since_last_purchase,
    "converted": converted,
})

df.to_csv("customer_campaign_data.csv", index=False)
print("Sample of generated dataset:")
print(df.head(), "\n")

# ----------------------------------------------------------------------
# 2. CUSTOMER SEGMENTATION (K-MEANS)
# ----------------------------------------------------------------------
seg_features = df[["income", "past_spend", "website_visits", "email_open_rate"]]
scaler = StandardScaler()
seg_scaled = scaler.fit_transform(seg_features)

kmeans = KMeans(n_clusters=4, random_state=42, n_init=10)
df["segment"] = kmeans.fit_predict(seg_scaled)

segment_names = {
    0: "Segment A",
    1: "Segment B",
    2: "Segment C",
    3: "Segment D",
}

summary = df.groupby("segment")[["income", "past_spend", "website_visits",
                                  "email_open_rate", "converted"]].mean().round(2)
summary["customer_count"] = df["segment"].value_counts().sort_index()
print("Segment profile summary:")
print(summary, "\n")

# Auto-label segments by behaviour so the report reads meaningfully
labels = {}
for seg_id, row in summary.iterrows():
    if row["past_spend"] == summary["past_spend"].max() and row["converted"] == summary["converted"].max():
        labels[seg_id] = "High-Value Loyalists"
    elif row["email_open_rate"] == summary["email_open_rate"].min():
        labels[seg_id] = "Disengaged / At-Risk"
    elif row["website_visits"] == summary["website_visits"].max():
        labels[seg_id] = "Browsers / Window Shoppers"
    else:
        labels[seg_id] = "Price-Sensitive Regulars"
df["segment_label"] = df["segment"].map(labels)
print("Auto-generated segment labels:", labels, "\n")

# Plot segments (income vs past_spend, colored by segment)
plt.figure(figsize=(6, 4.5))
for seg_id in sorted(df["segment"].unique()):
    subset = df[df["segment"] == seg_id]
    plt.scatter(subset["income"], subset["past_spend"], s=18, alpha=0.7,
                label=labels[seg_id])
plt.xlabel("Annual Income (INR equivalent)")
plt.ylabel("Past Spend")
plt.title("Customer Segments Identified by K-Means Clustering")
plt.legend(fontsize=8)
plt.tight_layout()
plt.savefig("segmentation_plot.png", dpi=150)
plt.close()

# ----------------------------------------------------------------------
# 3. CAMPAIGN CONVERSION PREDICTION (LOGISTIC REGRESSION)
# ----------------------------------------------------------------------
X = df[["age", "income", "past_spend", "website_visits",
        "email_open_rate", "days_since_last_purchase"]]
y = df["converted"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.25, random_state=42, stratify=y
)

X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

clf = LogisticRegression(max_iter=1000)
clf.fit(X_train_scaled, y_train)

y_pred = clf.predict(X_test_scaled)
y_proba = clf.predict_proba(X_test_scaled)[:, 1]

acc = accuracy_score(y_test, y_pred)
cm = confusion_matrix(y_test, y_pred)
report = classification_report(y_test, y_pred, target_names=["No Conversion", "Converted"])

print(f"Model accuracy: {acc:.2%}\n")
print("Confusion Matrix:\n", cm, "\n")
print("Classification Report:\n", report)

# Feature importance (coefficients)
coef_df = pd.DataFrame({
    "feature": X.columns,
    "coefficient": clf.coef_[0]
}).sort_values("coefficient", key=abs, ascending=False)
print("Feature influence on conversion likelihood:")
print(coef_df, "\n")

# Plot confusion matrix
plt.figure(figsize=(6, 4.5))
plt.imshow(cm, cmap="Blues")
plt.title("Confusion Matrix", fontsize=13)
plt.colorbar()
plt.xticks([0, 1], ["No Conversion", "Converted"])
plt.yticks([0, 1], ["No Conversion", "Converted"])
for i in range(2):
    for j in range(2):
        plt.text(j, i, cm[i, j], ha="center", va="center",
                  color="white" if cm[i, j] > cm.max() / 2 else "black", fontsize=14)
plt.xlabel("Predicted")
plt.ylabel("Actual")
plt.tight_layout()
plt.savefig("confusion_matrix.png", dpi=150)
plt.close()

# Plot feature importance
plt.figure(figsize=(6, 4))
colors = ["#2e7d32" if c > 0 else "#c62828" for c in coef_df["coefficient"]]
plt.barh(coef_df["feature"], coef_df["coefficient"], color=colors)
plt.xlabel("Coefficient (impact on conversion likelihood)")
plt.title("What Drives Campaign Conversion?", fontsize=13)
plt.tight_layout()
plt.savefig("feature_importance.png", dpi=150)
plt.close()

# ----------------------------------------------------------------------
# 4. SIMULATED "CAMPAIGN OPTIMIZATION" — before vs after AI targeting
# ----------------------------------------------------------------------
# Without AI: campaign sent to everyone (random) -> baseline conversion rate
baseline_rate = y.mean()

# With AI: campaign sent only to top 40% by predicted probability
all_proba = clf.predict_proba(scaler.transform(X))[:, 1]
df["predicted_probability"] = all_proba
top40_threshold = np.percentile(all_proba, 60)
targeted = df[df["predicted_probability"] >= top40_threshold]
targeted_conversion_rate = targeted["converted"].mean()

print(f"Baseline (send to everyone) conversion rate: {baseline_rate:.2%}")
print(f"AI-targeted (top 40% predicted) conversion rate: {targeted_conversion_rate:.2%}")
print(f"Improvement: {(targeted_conversion_rate - baseline_rate) / baseline_rate:.1%} relative lift")

plt.figure(figsize=(5, 4))
plt.bar(["Mass Campaign\n(no AI)", "AI-Targeted\nCampaign"],
        [baseline_rate * 100, targeted_conversion_rate * 100],
        color=["#9e9e9e", "#1565c0"])
plt.ylabel("Conversion Rate (%)")
plt.title("Campaign Optimization Impact: AI Targeting vs Mass Campaign")
for i, v in enumerate([baseline_rate * 100, targeted_conversion_rate * 100]):
    plt.text(i, v + 1, f"{v:.1f}%", ha="center", fontweight="bold")
plt.tight_layout()
plt.savefig("optimization_impact.png", dpi=150)
plt.close()

print("\nAll charts saved: segmentation_plot.png, confusion_matrix.png, "
      "feature_importance.png, optimization_impact.png")
print("Dataset saved: customer_campaign_data.csv")
