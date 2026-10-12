import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from pathlib import Path

import core_engine as engine

# -----------------------------------------------------------------------------
# App Configuration & Custom Theme
# -----------------------------------------------------------------------------
st.set_page_config(
    page_title="DMaut • AI Marketing Automation",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Custom High-End Styling
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@500;600;700;800&display=swap');

html, body, [class*="css"] {
    font-family: 'Plus Jakarta Sans', sans-serif !important;
}

h1, h2, h3, h4, .headline {
    font-family: 'Outfit', sans-serif !important;
    font-weight: 700;
}

/* Top bar and header cleanup */
header[data-testid="stHeader"] {
    background: transparent !important;
}
.stDeployButton, [data-testid="manage-app-button"] {
    display: none !important;
}

/* Base App Layout */
.stApp {
    background-color: #090d16;
    background-image: 
        radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.08) 0px, transparent 50%),
        radial-gradient(at 100% 100%, rgba(14, 165, 233, 0.06) 0px, transparent 50%);
    color: #f1f5f9;
}

.main .block-container {
    padding-top: 2rem !important;
    padding-bottom: 2rem !important;
    max-width: 1400px !important;
}

/* Glassmorphism Metric Cards */
.metric-card {
    background: linear-gradient(135deg, rgba(26, 34, 52, 0.6) 0%, rgba(15, 23, 42, 0.6) 100%);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 22px 24px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
    backdrop-filter: blur(14px);
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.metric-card:hover {
    transform: translateY(-3px);
    border-color: rgba(99, 102, 241, 0.4);
    box-shadow: 0 16px 40px rgba(99, 102, 241, 0.15);
}
.metric-title {
    color: #94a3b8;
    font-size: 0.78rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 8px;
}
.metric-val {
    font-family: 'Outfit', sans-serif;
    font-size: 2.1rem;
    font-weight: 800;
    color: #ffffff;
    line-height: 1;
    letter-spacing: -0.03em;
}
.metric-sub {
    font-size: 0.78rem;
    margin-top: 8px;
    color: #38bdf8;
    font-weight: 600;
}

/* Section Header Styling */
.section-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 18px;
    padding-bottom: 10px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
.section-title {
    font-size: 1.45rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: #ffffff;
    margin: 0;
}
.section-caption {
    color: #94a3b8;
    font-size: 0.88rem;
    margin: 0;
}

/* Top Website Navbar & Hero Header */
.top-navbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 24px;
    background: rgba(15, 23, 42, 0.75);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 18px;
    margin-bottom: 24px;
    backdrop-filter: blur(16px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
}
.brand-logo {
    display: flex;
    align-items: center;
    gap: 12px;
}
.brand-badge {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: linear-gradient(135deg, #6366f1 0%, #06b6d4 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    font-weight: 800;
    color: #fff;
    box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.brand-title {
    font-family: 'Outfit', sans-serif;
    font-size: 1.35rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: #ffffff;
    line-height: 1;
}
.brand-sub {
    font-size: 0.75rem;
    color: #94a3b8;
    margin-top: 3px;
    font-weight: 500;
}

/* Horizontal Nav Tabs at Top */
div[data-testid="stHorizontalBlock"]:has(.nav-tab-btn) {
    background: rgba(15, 23, 42, 0.6);
    padding: 6px 8px;
    border-radius: 14px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    margin-bottom: 24px;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
    backdrop-filter: blur(12px);
}

/* Top Hero Banner */
.hero-box {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.16) 0%, rgba(14, 165, 233, 0.08) 100%);
    border: 1px solid rgba(99, 102, 241, 0.3);
    border-radius: 24px;
    padding: 34px 38px;
    margin-bottom: 28px;
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.3);
    position: relative;
    overflow: hidden;
}
.hero-box::after {
    content: '';
    position: absolute;
    top: -50%;
    right: -10%;
    width: 320px;
    height: 320px;
    background: radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%);
    pointer-events: none;
}
.hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 14px;
    border-radius: 999px;
    background: rgba(99, 102, 241, 0.22);
    border: 1px solid rgba(99, 102, 241, 0.45);
    color: #c7d2fe;
    font-size: 0.76rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin-bottom: 14px;
}

/* Navigation Segmented Bar */
.nav-pills-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(15, 23, 42, 0.85);
    padding: 6px 10px;
    border-radius: 14px;
    border: 1px solid rgba(255, 255, 255, 0.08);
}

/* Sidebar Custom Styling */
section[data-testid="stSidebar"] {
    background-color: #0b1120 !important;
    border-right: 1px solid rgba(255, 255, 255, 0.08);
    min-width: 280px !important;
}

[data-testid="stSidebar"] h1, [data-testid="stSidebar"] h2, [data-testid="stSidebar"] h3,
[data-testid="stSidebar"] p, [data-testid="stSidebar"] span, [data-testid="stSidebar"] label {
    color: #e2e8f0 !important;
    font-weight: 600;
}

/* Enterprise Container & Card Styling */
.card-container {
    background: rgba(26, 34, 52, 0.45);
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    margin-bottom: 20px;
}

/* Button Styling */
.stButton > button {
    border-radius: 10px !important;
    font-weight: 600 !important;
    font-size: 0.88rem !important;
    border: none !important;
    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%) !important;
    color: #ffffff !important;
    box-shadow: 0 4px 14px rgba(99, 102, 241, 0.3) !important;
    transition: all 0.2s ease !important;
}
.stButton > button:hover {
    transform: translateY(-1px) !important;
    box-shadow: 0 8px 22px rgba(99, 102, 241, 0.45) !important;
}

.stDownloadButton > button {
    border-radius: 10px !important;
    font-weight: 600 !important;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
    border: none !important;
    color: #ffffff !important;
    box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3) !important;
}
.stDownloadButton > button:hover {
    transform: translateY(-1px) !important;
    box-shadow: 0 8px 22px rgba(16, 185, 129, 0.45) !important;
}
</style>
""", unsafe_allow_html=True)

# -----------------------------------------------------------------------------
# Initialize Session State
# -----------------------------------------------------------------------------
if "df" not in st.session_state:
    sample_csv = Path(__file__).resolve().parent / "sample_business_data.csv"
    if sample_csv.exists():
        st.session_state["df"] = pd.read_csv(sample_csv)
    else:
        st.session_state["df"] = engine.generate_marketing_data(600)

if "model_type" not in st.session_state:
    st.session_state["model_type"] = "Logistic Regression"

if "current_page" not in st.session_state:
    st.session_state["current_page"] = "📊 Overview"

# -----------------------------------------------------------------------------
# Top Website Navbar Header
# -----------------------------------------------------------------------------
st.markdown("""
<div class="top-navbar">
    <div class="brand-logo">
        <div class="brand-badge">⚡</div>
        <div>
            <div class="brand-title">DMaut</div>
            <div class="brand-sub">AI-Powered Marketing Automation & Campaign Optimizer</div>
        </div>
    </div>
    <div style="display:flex; align-items:center; gap:12px;">
        <span style="font-size:0.75rem; color:#10b981; font-weight:700; background:rgba(16, 185, 129, 0.15); border:1px solid rgba(16, 185, 129, 0.3); padding:4px 12px; border-radius:999px;">● Engine Online</span>
        <span style="font-size:0.75rem; color:#a5b4fc; background:rgba(99, 102, 241, 0.15); border:1px solid rgba(99, 102, 241, 0.3); padding:4px 12px; border-radius:999px;">v2.0 Enterprise</span>
    </div>
</div>
""", unsafe_allow_html=True)

# Top Website Navigation Bar (Hero Section Style)
nav_options = [
    "📊 Overview",
    "👥 Customer Personas",
    "🧠 Conversion AI",
    "🚀 Campaign Optimizer",
    "🔮 Propensity Predictor",
    "📂 Data Manager"
]

nav_cols = st.columns(len(nav_options))
for idx, col in enumerate(nav_cols):
    opt = nav_options[idx]
    is_active = (st.session_state["current_page"] == opt)
    with col:
        if st.button(
            opt,
            key=f"nav_top_{idx}",
            use_container_width=True,
            type="primary" if is_active else "secondary"
        ):
            st.session_state["current_page"] = opt
            st.rerun()

menu = st.session_state["current_page"]

# -----------------------------------------------------------------------------
# Sidebar: Parameter Controls
# -----------------------------------------------------------------------------
with st.sidebar:
    st.markdown("""
    <div style="font-size:0.78rem; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:14px;">
        ⚙️ AI Hyperparameters
    </div>
    """, unsafe_allow_html=True)
    
    model_choice = st.selectbox(
        "Predictive Architecture",
        ["Logistic Regression", "Random Forest"],
        index=0 if st.session_state["model_type"] == "Logistic Regression" else 1
    )
    st.session_state["model_type"] = model_choice
    
    n_clusters = st.slider("Segmentation Personas (K)", min_value=2, max_value=6, value=4)
    target_top_pct = st.slider("Selective Cutoff (% Top Audience)", min_value=10, max_value=90, value=35, step=5)
    
    st.markdown("---")
    st.markdown("""
    <div style="font-size:0.78rem; color:#94a3b8; line-height:1.6;">
        <b>Audience Calibration:</b><br>
        Models recompute dynamically via 5-Fold Stratified Cross Validation.
    </div>
    """, unsafe_allow_html=True)

# -----------------------------------------------------------------------------
# Compute Core Engine Outputs Cached
# -----------------------------------------------------------------------------
df = st.session_state["df"]

segmented_df, personas_summary = engine.perform_segmentation(df, n_clusters=n_clusters)
model_results = engine.train_conversion_model(df, model_type=st.session_state["model_type"])
campaign_results = engine.simulate_campaign(
    segmented_df,
    model_results["probabilities"],
    top_pct=target_top_pct
)

# -----------------------------------------------------------------------------
# View: 1. Dashboard Overview
# -----------------------------------------------------------------------------
# View: 1. Dashboard Overview
# -----------------------------------------------------------------------------
if menu == "📊 Overview":
    st.markdown(f"""
    <div class="hero-box">
        <span class="hero-badge">AI Marketing Intelligence</span>
        <h1 style="margin:0 0 8px; font-size:2.4rem; color:#fff; letter-spacing:-0.03em;">Campaign Intelligence & Optimization</h1>
        <p style="margin:0; color:#94a3b8; font-size:1.05rem; max-width:850px; line-height:1.6;">
            Harness predictive machine learning to segment audiences, identify high-intent conversion drivers, 
            and target qualified customers with maximum ROI.
        </p>
    </div>
    """, unsafe_allow_html=True)
    
    # 4 Quick Metric Cards
    c1, c2, c3, c4 = st.columns(4)
    with c1:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-title">Total Customer Pool</div>
            <div class="metric-val">{len(df):,}</div>
            <div class="metric-sub">Active Marketing Audience</div>
        </div>
        """, unsafe_allow_html=True)
    with c2:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-title">Baseline Conversion</div>
            <div class="metric-val">{campaign_results['baseline_rate']:.1%}</div>
            <div class="metric-sub">Un-targeted "Blast Everyone"</div>
        </div>
        """, unsafe_allow_html=True)
    with c3:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-title">Targeted Conversion</div>
            <div class="metric-val">{campaign_results['targeted_rate']:.1%}</div>
            <div class="metric-sub" style="color:#10b981;">{campaign_results['lift']:+.1f}% Conversion Lift</div>
        </div>
        """, unsafe_allow_html=True)
    with c4:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-title">AI Model Accuracy</div>
            <div class="metric-val">{model_results['accuracy']:.1%}</div>
            <div class="metric-sub">ROC-AUC: {model_results['roc_auc']:.3f}</div>
        </div>
        """, unsafe_allow_html=True)
        
    st.markdown("<br>", unsafe_allow_html=True)
    
    # Overview Visuals
    col_chart1, col_chart2 = st.columns([1.2, 1])
    with col_chart1:
        st.markdown("### 📈 Campaign Strategy Comparison")
        comp_df = pd.DataFrame({
            "Strategy": ["Email Everyone (Blast)", f"AI Targeted (Top {target_top_pct}%)"],
            "Conversion Rate (%)": [campaign_results['baseline_rate'] * 100, campaign_results['targeted_rate'] * 100],
            "Net Profit ($)": [campaign_results['blast_profit'], campaign_results['targeted_profit']]
        })
        fig_bar = px.bar(
            comp_df,
            x="Strategy",
            y="Conversion Rate (%)",
            color="Strategy",
            color_discrete_sequence=["#64748b", "#6366f1"],
            text_auto=".1f",
            template="plotly_dark"
        )
        fig_bar.update_layout(showlegend=False, paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)")
        st.plotly_chart(fig_bar, use_container_width=True)
        
    with col_chart2:
        st.markdown("### 👥 Audience Persona Distribution")
        fig_pie = px.pie(
            personas_summary,
            names="persona",
            values="customers",
            hole=0.45,
            color_discrete_sequence=px.colors.qualitative.Prism,
            template="plotly_dark"
        )
        fig_pie.update_layout(paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)")
        st.plotly_chart(fig_pie, use_container_width=True)

# -----------------------------------------------------------------------------
# View: 2. Customer Personas (Clustering)
# -----------------------------------------------------------------------------
elif menu == "👥 Customer Personas":
    st.markdown("## 👥 Customer Personas & Behavioral Segmentation")
    st.write("Using unsupervised K-Means clustering across spending, engagement, and visit history to discover distinct buyer personas.")
    
    # Persona Table
    display_summary = personas_summary.copy()
    display_summary["avg_income"] = display_summary["avg_income"].map("${:,.0f}".format)
    display_summary["avg_spend"] = display_summary["avg_spend"].map("${:,.2f}".format)
    display_summary["avg_visits"] = display_summary["avg_visits"].map("{:.1f}".format)
    display_summary["avg_email_open"] = display_summary["avg_email_open"].map("{:.1%}".format)
    display_summary["conversion_rate"] = display_summary["conversion_rate"].map("{:.1%}".format)
    display_summary = display_summary.rename(columns={
        "persona": "Persona",
        "customers": "Customers",
        "avg_income": "Avg Income",
        "avg_spend": "Avg Past Spend",
        "avg_visits": "Avg Website Visits",
        "avg_email_open": "Email Open Rate",
        "conversion_rate": "Historical Conversion"
    })
    
    st.dataframe(display_summary.drop(columns=["cluster"]), use_container_width=True)
    
    # Persona Clustering Explorer with Combined vs Separated views
    st.markdown("### 🔍 Customer Cluster Analysis")
    
    view_col1, view_col2 = st.columns([1.2, 1.8])
    with view_col1:
        cluster_view_mode = st.radio(
            "Visualization Mode:",
            ["🌈 Mixed (All Clusters Combined)", "📑 Split Grid (View Each Separately)", "🎯 Focus on Single Persona"],
            horizontal=True
        )
    
    unique_personas = list(personas_summary["persona"])
    
    if cluster_view_mode == "🌈 Mixed (All Clusters Combined)":
        fig_scatter = px.scatter(
            segmented_df,
            x="income",
            y="past_spend",
            color="persona",
            size="website_visits",
            hover_data=["customer_id", "email_open_rate", "website_visits"],
            labels={"income": "Annual Income ($)", "past_spend": "Past Spend ($)", "persona": "Persona"},
            color_discrete_sequence=px.colors.qualitative.Prism,
            template="plotly_dark",
            title="Combined Audience Persona Map"
        )
        fig_scatter.update_layout(
            paper_bgcolor="rgba(0,0,0,0)",
            plot_bgcolor="rgba(0,0,0,0)",
            height=480,
            legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1)
        )
        st.plotly_chart(fig_scatter, use_container_width=True)
        
    elif cluster_view_mode == "📑 Split Grid (View Each Separately)":
        st.caption("Side-by-side behavioral breakdown: each customer persona rendered in its own dedicated subplot.")
        fig_facet = px.scatter(
            segmented_df,
            x="income",
            y="past_spend",
            color="persona",
            facet_col="persona",
            facet_col_wrap=2,
            size="website_visits",
            hover_data=["customer_id", "email_open_rate"],
            labels={"income": "Annual Income ($)", "past_spend": "Past Spend ($)", "persona": "Persona"},
            color_discrete_sequence=px.colors.qualitative.Prism,
            template="plotly_dark",
            height=580
        )
        fig_facet.update_layout(
            paper_bgcolor="rgba(0,0,0,0)",
            plot_bgcolor="rgba(0,0,0,0)",
            showlegend=False
        )
        st.plotly_chart(fig_facet, use_container_width=True)
        
    else:  # Focus on Single Persona
        selected_persona = st.selectbox("Select Persona to Inspect Separately:", unique_personas)
        subset_df = segmented_df[segmented_df["persona"] == selected_persona]
        
        c_p1, c_p2, c_p3 = st.columns(3)
        c_p1.metric("Audience Size", f"{len(subset_df):,} customers", f"{(len(subset_df)/len(segmented_df)):.1%} of Total")
        c_p2.metric("Average Past Spend", f"${subset_df['past_spend'].mean():,.2f}")
        c_p3.metric("Persona Conversion Rate", f"{subset_df['converted'].mean():.1%}")
        
        fig_focus = px.scatter(
            subset_df,
            x="income",
            y="past_spend",
            color="converted",
            size="website_visits",
            color_continuous_scale=["#f43f5e", "#10b981"],
            hover_data=["customer_id", "email_open_rate"],
            labels={"income": "Annual Income ($)", "past_spend": "Past Spend ($)", "converted": "Converted (0/1)"},
            template="plotly_dark",
            title=f"Isolated Analysis: {selected_persona}"
        )
        fig_focus.update_layout(paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)", height=450)
        st.plotly_chart(fig_focus, use_container_width=True)
    
    # Actionable Marketing Recommendations
    st.markdown("### 💡 Recommended Marketing Playbook by Persona")
    t1, t2, t3 = st.columns(3)
    with t1:
        st.info("⭐ **High-Value Loyalists**\n\nReward with exclusive VIP discounts, early product drop access, and premium concierge support to maximize retention.")
    with t2:
        st.warning("👀 **Window Shoppers**\n\nSend trigger-based browse abandonment reminders, limited-time countdown coupons, and social proof testimonials.")
    with t3:
        st.error("⚠️ **Disengaged / At-Risk**\n\nDeploy automated win-back reactivation email sequences or decrease email frequency to avoid list burnout.")

# -----------------------------------------------------------------------------
# View: 3. Conversion AI & Drivers
# -----------------------------------------------------------------------------
elif menu == "🧠 Conversion AI":
    st.markdown(f"## 🧠 Conversion AI Engine ({st.session_state['model_type']})")
    st.write("Understand what drives customer conversions and inspect model validation metrics evaluated on unseen cross-validation folds.")
    
    m1, m2, m3, m4 = st.columns(4)
    m1.metric("Accuracy", f"{model_results['accuracy']:.1%}")
    m2.metric("Precision", f"{model_results['precision']:.1%}")
    m3.metric("Recall", f"{model_results['recall']:.1%}")
    m4.metric("ROC-AUC Score", f"{model_results['roc_auc']:.3f}")
    
    st.markdown("<br>", unsafe_allow_html=True)
    c_feat, c_cm = st.columns([1.3, 1])
    
    with c_feat:
        st.markdown("### 🎯 What Drives Conversions? (Feature Importance)")
        weights = model_results["feature_importance"].reset_index()
        weights.columns = ["Feature", "Importance"]
        weights["Feature Name"] = weights["Feature"].map(engine.FEATURE_LABELS)
        
        fig_feat = px.bar(
            weights,
            x="Importance",
            y="Feature Name",
            orientation="h",
            color="Importance",
            color_continuous_scale=["#f43f5e", "#6366f1", "#10b981"],
            template="plotly_dark"
        )
        fig_feat.update_layout(
            paper_bgcolor="rgba(0,0,0,0)",
            plot_bgcolor="rgba(0,0,0,0)",
            yaxis={"autorange": "reversed"},
            coloraxis_showscale=False
        )
        st.plotly_chart(fig_feat, use_container_width=True)
        
    with c_cm:
        st.markdown("### 📊 Cross-Validation Confusion Matrix")
        cm = model_results["confusion_matrix"]
        fig_cm = px.imshow(
            cm,
            labels=dict(x="Predicted Conversion", y="Actual Conversion", color="Customers"),
            x=["Did Not Convert", "Converted"],
            y=["Did Not Convert", "Converted"],
            text_auto=True,
            color_continuous_scale="Purples",
            template="plotly_dark"
        )
        fig_cm.update_layout(paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)")
        st.plotly_chart(fig_cm, use_container_width=True)

# -----------------------------------------------------------------------------
# View: 4. Campaign Optimizer & ROI
# -----------------------------------------------------------------------------
elif menu == "🚀 Campaign Optimizer":
    st.markdown("## 🚀 Campaign Optimization & Financial Simulator")
    st.write(f"Compare blanket mass email blasts with precision AI targeting targeting the top **{target_top_pct}%** most likely responders.")
    
    # Financial Controls
    st.markdown("### 💵 Campaign Economics Settings")
    ec1, ec2 = st.columns(2)
    with ec1:
        cost_msg = st.number_input("Cost per Contact / Message ($)", value=0.15, min_value=0.01, step=0.01)
    with ec2:
        val_conv = st.number_input("Average Order Value / Conversion ($)", value=65.00, min_value=1.00, step=5.00)
        
    sim = engine.simulate_campaign(
        segmented_df,
        model_results["probabilities"],
        top_pct=target_top_pct,
        cost_per_contact=cost_msg,
        rev_per_conversion=val_conv
    )
    
    st.markdown("<br>", unsafe_allow_html=True)
    r1, r2, r3, r4 = st.columns(4)
    r1.metric("Audience Size", f"{sim['n_target']:,} customers", f"Filtered from {sim['n_total']:,}")
    r2.metric("Targeted Conversion", f"{sim['targeted_rate']:.1%}", f"{sim['lift']:+.1f}% vs Baseline")
    r3.metric("Cost Savings", f"${sim['savings']:,.2f}", "Unspent Marketing Budget")
    r4.metric("Net Profit Uplift", f"${sim['targeted_profit']:,.2f}", f"Targeted ROI: {sim['targeted_roi']:,.1f}%")
    
    st.markdown("<br>", unsafe_allow_html=True)
    
    # Export Ready Audience
    st.markdown(f"### 🎯 Download AI-Targeted Customer Audience (Top {target_top_pct}%)")
    export_df = sim["export_df"][["customer_id", "persona", "conversion_probability", "past_spend", "email_open_rate"]]
    st.dataframe(export_df.head(10), use_container_width=True)
    
    csv_bytes = export_df.to_csv(index=False).encode("utf-8")
    st.download_button(
        label=f"📥 Download Export CSV ({len(export_df):,} Customers)",
        data=csv_bytes,
        file_name=f"dmaut_target_audience_top_{target_top_pct}pct.csv",
        mime="text/csv"
    )

# -----------------------------------------------------------------------------
# View: 5. Live Customer Predictor
# -----------------------------------------------------------------------------
elif menu == "🔮 Propensity Predictor":
    st.markdown("## 🔮 Live Customer Conversion Predictor")
    st.write("Test individual customer scenarios interactively to see how behavioral attributes influence their predicted probability of buying.")
    
    p1, p2, p3 = st.columns(3)
    with p1:
        in_age = st.slider("Customer Age", 18, 80, 36)
        in_income = st.slider("Annual Income ($)", 10000, 150000, 58000, step=2000)
    with p2:
        in_spend = st.slider("Past Spend ($)", 0, 15000, 3200, step=100)
        in_visits = st.slider("Website Visits", 0, 30, 8)
    with p3:
        in_open = st.slider("Email Open Rate (%)", 0, 100, 45) / 100.0
        in_recency = st.slider("Days Since Last Purchase", 1, 200, 22)
        
    query_customer = {
        "age": in_age,
        "income": in_income,
        "past_spend": in_spend,
        "website_visits": in_visits,
        "email_open_rate": in_open,
        "days_since_last_purchase": in_recency
    }
    
    pred_prob, pred_class = engine.predict_single_customer(model_results["pipeline"], query_customer)
    
    st.markdown("<br>", unsafe_allow_html=True)
    c_res1, c_res2 = st.columns([1, 1.5])
    
    with c_res1:
        st.markdown(f"""
        <div class="metric-card" style="border-color: {'#10b981' if pred_class == 1 else '#f43f5e'};">
            <div class="metric-title">Predicted Conversion Probability</div>
            <div class="metric-val" style="color: {'#10b981' if pred_class == 1 else '#f43f5e'}; font-size:2.4rem;">
                {pred_prob:.1%}
            </div>
            <div class="metric-sub" style="color: #ffffff; font-size:1rem;">
                Outcome: {'✅ Likely to Convert (Target)' if pred_class == 1 else '❌ Unlikely to Convert (Skip/Nurture)'}
            </div>
        </div>
        """, unsafe_allow_html=True)
        
    with c_res2:
        gauge_fig = go.Figure(go.Indicator(
            mode="gauge+number",
            value=pred_prob * 100,
            domain={'x': [0, 1], 'y': [0, 1]},
            title={'text': "Propensity Score", 'font': {'color': '#f8fafc'}},
            gauge={
                'axis': {'range': [0, 100], 'tickcolor': "#94a3b8"},
                'bar': {'color': "#6366f1"},
                'steps': [
                    {'range': [0, 40], 'color': "rgba(244, 63, 94, 0.25)"},
                    {'range': [40, 70], 'color': "rgba(245, 158, 11, 0.25)"},
                    {'range': [70, 100], 'color': "rgba(16, 185, 129, 0.25)"}
                ],
                'threshold': {
                    'line': {'color': "#ffffff", 'width': 4},
                    'thickness': 0.75,
                    'value': 50
                }
            }
        ))
        gauge_fig.update_layout(paper_bgcolor="rgba(0,0,0,0)", font={'color': "#ffffff"}, height=240)
        st.plotly_chart(gauge_fig, use_container_width=True)

# -----------------------------------------------------------------------------
# View: 6. Data Manager
# -----------------------------------------------------------------------------
elif menu == "📂 Data Manager":
    st.markdown("""
    <div class="section-header">
        <div>
            <h2 class="section-title">Data Management Studio</h2>
            <p class="section-caption">Upload customer audiences, download schema templates, or synthesize testing cohorts.</p>
        </div>
    </div>
    """, unsafe_allow_html=True)
    
    col_up, col_gen = st.columns([1.1, 0.9])
    
    with col_up:
        with st.container():
            st.markdown("""
            <div class="card-container">
                <div style="font-size:1.1rem; font-weight:700; color:#fff; margin-bottom:4px;">📤 Import Audience File</div>
                <div style="font-size:0.8rem; color:#94a3b8; margin-bottom:16px;">Accepts CSV format with historical campaign conversion flags.</div>
            """, unsafe_allow_html=True)
            
            uploaded_file = st.file_uploader("Upload customer CSV", type=["csv"], label_visibility="collapsed")
            if uploaded_file is not None:
                try:
                    user_df = pd.read_csv(uploaded_file)
                    missing = [col for col in engine.FEATURES if col not in user_df.columns]
                    if missing:
                        st.error(f"Missing required columns in CSV: {', '.join(missing)}")
                    else:
                        if "converted" not in user_df.columns:
                            st.error("CSV must contain a 'converted' column (1 or 0) for model training.")
                        else:
                            st.session_state["df"] = user_df
                            st.success(f"✓ Audience verified & loaded: {len(user_df):,} customer records active.")
                            st.rerun()
                except Exception as e:
                    st.error(f"Error processing file: {e}")
                    
            st.markdown("</div>", unsafe_allow_html=True)
                
    with col_gen:
        with st.container():
            st.markdown("""
            <div class="card-container">
                <div style="font-size:1.1rem; font-weight:700; color:#fff; margin-bottom:4px;">⚡ Synthesize Customer Cohort</div>
                <div style="font-size:0.8rem; color:#94a3b8; margin-bottom:16px;">Generate statistically calibrated marketing audience records.</div>
            """, unsafe_allow_html=True)
            
            n_rows = st.number_input("Audience Size", min_value=100, max_value=5000, value=600, step=100)
            if st.button("Generate Fresh Dataset", use_container_width=True):
                new_df = engine.generate_marketing_data(n_samples=n_rows)
                st.session_state["df"] = new_df
                st.success(f"Generated {n_rows:,} customer records with realistic engagement signals!")
                st.rerun()
                
            st.markdown("</div>", unsafe_allow_html=True)
            
    st.markdown("<br>", unsafe_allow_html=True)
    
    # Active Dataset Header & Clean Data Preview
    st.markdown("""
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <div style="font-size:1.15rem; font-weight:700; color:#fff;">📋 Active Audience Database</div>
        <div style="font-size:0.82rem; color:#38bdf8; font-weight:600;">Status: Ready for Modeling</div>
    </div>
    """, unsafe_allow_html=True)
    
    # Clean preview with formatted columns
    preview_df = df.head(15).copy()
    if "income" in preview_df.columns:
        preview_df["income"] = preview_df["income"].map("${:,.0f}".format)
    if "past_spend" in preview_df.columns:
        preview_df["past_spend"] = preview_df["past_spend"].map("${:,.2f}".format)
    if "email_open_rate" in preview_df.columns:
        preview_df["email_open_rate"] = preview_df["email_open_rate"].map("{:.1%}".format)
    if "converted" in preview_df.columns:
        preview_df["converted"] = preview_df["converted"].map(lambda x: "✓ Converted (1)" if x == 1 else "✗ No (0)")
        
    st.dataframe(preview_df, use_container_width=True, height=380)
