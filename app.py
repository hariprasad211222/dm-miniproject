"""
DMaut - AI-Enabled Marketing Automation and Campaign Optimization

    python create_admin.py       (once, to create an admin account)
    streamlit run app.py

Optional: run two separate "sites" from the same code, one per role:
    DMAUT_MODE=user  streamlit run app.py --server.port 8501   (customers' site)
    DMAUT_MODE=admin streamlit run app.py --server.port 8502   (admin console)
"""
import html
import os
import re
from pathlib import Path

import matplotlib.pyplot as plt
import pandas as pd
import streamlit as st
from dotenv import load_dotenv

import analysis
import db
import ingest

load_dotenv()

MODE = os.environ.get("DMAUT_MODE", "").strip().lower()
if MODE not in ("admin", "user"):
    MODE = ""

st.set_page_config(page_title="DMaut Admin" if MODE == "admin" else "DMaut", page_icon=None, layout="wide")

THEME_TOML = """[theme]
base = "light"
primaryColor = "#1f3864"
backgroundColor = "#f5f7fa"
secondaryBackgroundColor = "#ffffff"
textColor = "#1b2433"
font = "sans serif"

[server]
maxUploadSize = 5

[browser]
gatherUsageStats = false
"""


def ensure_theme_config():
    if os.environ.get("DMAUT_SKIP_THEME_CHECK") or st.get_option("theme.base") == "light":
        return
    config_file = Path.cwd() / ".streamlit" / "config.toml"
    if config_file.exists():
        st.warning('Your .streamlit/config.toml should contain  base = "light"  under [theme] for DMaut to look right.')
        return
    config_file.parent.mkdir(exist_ok=True)
    config_file.write_text(THEME_TOML, encoding="utf-8")
    st.warning(
        "First-run setup finished: DMaut saved its theme settings. "
        "Please stop the app (press Ctrl+C in the terminal) and run `streamlit run app.py` once more."
    )
    st.stop()


ensure_theme_config()

# ----------------------------------------------------------------------
# Styling
# ----------------------------------------------------------------------
NAVY = "#1f3864"
ACCENT = "#2f6db5"
ORANGE = "#e8491d"
ORANGE_STRONG = "#d53d1f"
BG = "#f5f7fa"
SURFACE = "#ffffff"
BORDER = "#dfe4ec"
TEXT = "#1b2433"
MUTED = "#5b6779"
SUCCESS = "#1f7a4d"
WARNING = "#b26a00"
DANGER = "#b3261e"
BADGE_COLORS = [NAVY, SUCCESS, ACCENT, "#6b7ea8", "#6c8cb7", SUCCESS]
MPL_PALETTE = [NAVY, ACCENT, SUCCESS, "#6d7ea8", "#8ca4c7", "#2b4f77"]

CSS = """
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Source+Serif+4:wght@600&display=swap');
:root {
  --bg:#f5f7fa;
  --panel:#ffffff;
  --card:#ffffff;
  --ink:#1b2433;
  --muted:#5b6779;
  --line:#dfe4ec;
  --navy:#1f3864;
  --navy-dark:#162a4a;
  --accent:#2f6db5;
  --orange:#e8491d;
  --orange-strong:#d53d1f;
  --success:#1f7a4d;
  --warning:#b26a00;
  --danger:#b3261e;
  --shadow:0 1px 2px rgba(16,24,40,.06);
}
html, body, [class*="css"] { font-family:'Inter','Segoe UI',Arial,sans-serif; font-size:15px; line-height:1.5; color:var(--ink); }
h1, h2, h3, h4, .dmaut-brand-title { font-family:'Source Serif 4',Georgia,serif; color:var(--ink); margin:0 0 0.35rem 0; }
.stApp { background: var(--bg); }
section[data-testid="stSidebar"] {
  background: var(--navy);
  border-right: 1px solid rgba(255,255,255,0.1);
  box-shadow: none;
  min-width: 295px !important;
  width: 300px !important;
  color: #fff !important;
}
section[data-testid="stSidebar"] > div {
  background: transparent;
  color: #f5f0ea;
}
section[data-testid="stMain"] > div { background:var(--bg); }
[data-testid="stSidebar"] h1,
[data-testid="stSidebar"] h2,
[data-testid="stSidebar"] h3,
[data-testid="stSidebar"] h4,
[data-testid="stSidebar"] p,
[data-testid="stSidebar"] div,
[data-testid="stSidebar"] span,
[data-testid="stSidebar"] label {
  color: #f5f0ea !important;
}
[data-testid="stVerticalBlockBorderWrapper"] { background:transparent; border:none; box-shadow:none; padding:0; }
.main .block-container { padding-top:0; max-width: 100%; }

.sidebar-shell {
  background: linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02));
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 18px;
  padding: 14px 12px;
  margin: 8px 0 18px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), 0 16px 24px rgba(13,17,26,0.18);
}
.sidebar-head {
  display:flex;
  align-items:center;
  gap: 10px;
  padding: 4px 4px 12px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  margin-bottom: 12px;
}
.sidebar-brand-icon {
  display:flex;
  align-items:center;
  justify-content:center;
  width: 34px;
  height: 34px;
  border-radius: 12px;
  background: linear-gradient(135deg, #f3a14c, #ea5b3a);
  color: #fff;
  font-weight: 800;
  box-shadow: 0 12px 20px rgba(234,91,58,0.28);
}
.sidebar-brand-name {
  font-size: 0.84rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #f5f0ea;
}
.sidebar-brand-meta {
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(246,240,233,0.72);
}

[data-testid="stSidebar"] .stRadio > div {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 8px;
}
[data-testid="stSidebar"] .stRadio > div > label {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  padding: 0.78rem 0.82rem;
  margin: 0;
  color: rgba(255,255,255,0.9);
  font-weight: 600;
  transition: all 0.2s ease;
  opacity: 1;
  visibility: visible;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.02);
}
[data-testid="stSidebar"] .stRadio > div > label:hover {
  border-color: rgba(250,170,90,0.52);
  background: rgba(255,255,255,0.07);
  transform: translateY(-1px);
}
[data-testid="stSidebar"] .stRadio > div > label:has(input:checked) {
  background: linear-gradient(135deg, rgba(234,91,58,0.18), rgba(255,255,255,0.04));
  border-color: rgba(255,165,99,0.65);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.1), 0 14px 18px rgba(234,91,58,0.12);
}
[data-testid="stSidebar"] .stRadio > div > label > div {
  display: flex;
  align-items: center;
  gap: 10px;
}
[data-testid="stSidebar"] .stRadio input[type="radio"] {
  accent-color: #f4b464;
  opacity: 1;
}
[data-testid="stSidebar"] .stRadio input[type="radio"]:checked + div {
  color: #f5f0ea;
}
[data-testid="stSidebar"] .stMarkdownContainer p,
[data-testid="stSidebar"] .stMarkdownContainer strong,
[data-testid="stSidebar"] .stMarkdownContainer span,
[data-testid="stSidebar"] .stMarkdownContainer div {
  color: rgba(255,255,255,0.92);
}
[data-testid="stSidebar"] .stMarkdownContainer {
  padding-left: 0.15rem;
}
[data-testid="stSidebar"] .stButton > button {
  width: 100%;
  border-radius: 12px;
  background: linear-gradient(135deg, #ea5b3a, #d94a2a);
  color: white;
  border: none;
  font-weight: 700;
  box-shadow: 0 10px 18px rgba(234,91,58,0.18);
}
[data-testid="stSidebar"] .stSidebarNav {
  background: transparent;
}

.dmaut-topbar {
  height: 44px;
  display:flex;
  align-items:center;
  justify-content:flex-end;
  padding: 0 16px;
  background: var(--dark);
  border-bottom: 1px solid rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.8);
}
.dmaut-topbar-spacer { flex:1; }
.dmaut-deploy { color: rgba(255,255,255,0.82); font-size:0.76rem; font-weight:600; }

.dmaut-login-shell {
  width: min(520px, calc(100% - 32px));
  margin: 26px auto 0;
}
.dmaut-brand-card {
  text-align:center;
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(61,52,45,0.12);
  border-radius: 10px;
  padding: 20px 18px 18px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.30);
}
.dmaut-brand-icon { font-size:2.05rem; margin-bottom:10px; }
.dmaut-brand-title {
  font-size:0.92rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-weight: 800;
  color:var(--ink);
}
.dmaut-brand-subtitle {
  margin:10px 0 0;
  color:var(--muted);
  font-size:0.8rem;
  font-weight:500;
}

.dmaut-auth-wrap {
  position: relative;
  margin-top: 14px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(61,52,45,0.12);
  border-radius: 10px;
  padding: 12px 14px 14px;
  box-shadow: none;
}

.stTabs [data-baseweb="tab-list"] {
  gap: 8px;
  background: transparent;
  border: none;
  padding: 0;
  margin: 0 0 6px;
}
.stTabs [data-baseweb="tab"] {
  height: 32px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
  color: var(--muted);
  font-weight: 600;
  font-size: 0.8rem;
  padding: 0 12px;
}
.stTabs [aria-selected="true"] {
  background: var(--orange) !important;
  color: #fff !important;
  border-color: var(--orange) !important;
  box-shadow: none !important;
}

.stTextInput > div > div > input,
.stTextInput > div > div > div > input,
.stPasswordInput > div > div > input,
.stPasswordInput > div > div > div > input {
  border: 1px solid rgba(61,52,45,0.14) !important;
  background: rgba(255,255,255,0.18) !important;
  border-radius: 8px !important;
  min-height: 42px !important;
  padding: 8px 10px !important;
  color: var(--ink) !important;
  box-shadow:none !important;
}
.stTextInput label, .stPasswordInput label {
  color: rgba(29, 36, 47, 0.9) !important;
  font-size: 0.76rem !important;
  font-weight: 600 !important;
  margin-bottom: 6px !important;
}

[data-testid="stFormSubmitButton"] > button {
  width: fit-content;
  min-width: 110px;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: linear-gradient(180deg, var(--orange) 0%, var(--orange-strong) 100%);
  color: #fff;
  font-weight: 700;
  box-shadow: none;
}
[data-testid="stFormSubmitButton"] > button:hover {
  background: linear-gradient(180deg, #f58c68 0%, var(--orange) 100%);
}

.login-error {
  margin-top: 10px;
  padding:8px 10px;
  border-radius:8px;
  background: rgba(217,83,83,0.08);
  border: 1px solid rgba(217,83,83,0.16);
  color:#af3d38;
  font-size:0.8rem;
  font-weight:600;
}

.dmaut-demo { margin-top:8px; padding:10px 12px; border-radius:10px; background:rgba(29,44,58,0.04); border:1px solid rgba(29,44,58,0.08); color:#1d2c3a; font-size:0.78rem; }
.dmaut-demo strong { display:block; font-size:0.72rem; letter-spacing:0.08em; text-transform:uppercase; margin-bottom:4px; }
.dmaut-demo span { display:block; line-height:1.6; }

.divider-soft {
  border-top: 1px solid rgba(29,36,47,0.12);
}

/* Product dashboard polish */
.main .block-container {
  padding-top: 1.2rem;
  padding-left: 2rem !important;
  padding-right: 2rem !important;
}

div[data-testid="stVerticalBlock"] > div:has(> .rit-header),
div[data-testid="stVerticalBlock"] > div:has(> .rit-ticker),
div[data-testid="stVerticalBlock"] > div:has(> .rit-hero),
div[data-testid="stVerticalBlock"] > div:has(> .action-strip) {
  margin-bottom: 0;
}

.rit-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 22px 16px;
  margin-top: 4px;
  background: linear-gradient(135deg, rgba(17,24,33,0.98), rgba(22,28,38,0.98));
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 22px 22px 0 0;
  box-shadow: 0 18px 32px rgba(17, 24, 33, 0.16);
}
.rit-header .title {
  font-size: 1.12rem;
  font-weight: 800;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #f9f5f1;
}
.rit-header .subtitle {
  font-size: 0.76rem;
  color: rgba(249,245,241,0.72);
  margin-top: 3px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.rit-header .role-badge {
  margin-left: auto;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.12);
  color: #f9f5f1;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.rit-kpi-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin: 0 0 18px;
  padding: 0 6px;
}
.rit-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid rgba(17,24,33,0.08);
  background: rgba(255,255,255,0.26);
  color: var(--ink);
  font-size: 0.66rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 800;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.28);
}
.rit-pill.success {
  background: rgba(31,122,77,0.08);
  border-color: rgba(31,122,77,0.14);
  color: #195f41;
}
.rit-pill.accent {
  background: rgba(232,73,29,0.08);
  border-color: rgba(232,73,29,0.14);
  color: var(--orange-strong);
}
.rit-pill.muted {
  background: rgba(17,24,33,0.03);
  border-color: rgba(17,24,33,0.08);
  color: var(--ink);
}

.rit-ticker {
  display: flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, rgba(217, 166, 46, 0.18), rgba(232, 73, 29, 0.1));
  border: 1px solid rgba(41, 31, 17, 0.08);
  border-radius: 14px;
  padding: 12px 16px;
  margin-bottom: 20px;
  font-size: 0.82rem;
  color: #3b2f2d;
  box-shadow: 0 8px 16px rgba(41, 31, 17, 0.03);
}
.rit-ticker .badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 8px;
  border-radius: 999px;
  background: #2f1d15;
  color: #f8f5ef;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.rit-hero {
  padding: 18px 8px 20px;
  margin-bottom: 14px;
  background: linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.02));
  border-radius: 22px;
  border: 1px solid rgba(29,36,47,0.06);
}
.rit-hero .pill {
  display: inline-block;
  margin-bottom: 12px;
  padding: 7px 12px;
  border-radius: 999px;
  background: rgba(232, 73, 29, 0.08);
  border: 1px solid rgba(232, 73, 29, 0.14);
  color: var(--orange-strong);
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  font-weight: 800;
  text-transform: uppercase;
}
.rit-hero h1 {
  font-size: clamp(2.4rem, 3vw, 4.1rem);
  line-height: 0.98;
  letter-spacing: -0.07em;
  margin: 0 0 12px;
  font-weight: 900;
  color: var(--ink);
}
.rit-hero h1 .accent {
  color: var(--orange-strong);
}
.rit-hero p {
  max-width: 980px;
  color: var(--muted);
  font-size: 1.04rem;
  line-height: 1.7;
  margin: 0;
}

.action-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin: 18px 0 22px;
}
.action-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(255,255,255,0.28);
  border: 1px solid rgba(29,36,47,0.08);
  color: var(--ink);
  font-size: 0.78rem;
  font-weight: 700;
  box-shadow: 0 8px 18px rgba(41,31,17,0.03);
}

div[data-testid="stTabs"] [data-baseweb="tab-list"] {
  gap: 10px;
  background: transparent;
  border-bottom: 1px solid rgba(29,36,47,0.12);
  padding-bottom: 2px;
  margin-bottom: 18px;
}
div[data-testid="stTabs"] [data-baseweb="tab"] {
  border: 1px solid transparent;
  border-radius: 10px 10px 0 0;
  border-bottom: 0;
  padding: 10px 16px;
  background: rgba(255,255,255,0.18);
  color: var(--muted);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
div[data-testid="stTabs"] [aria-selected="true"] {
  background: linear-gradient(180deg, rgba(232,73,29,0.98), rgba(221,89,47,0.96)) !important;
  color: #fff !important;
  border-color: rgba(232,73,29,0.98) !important;
  box-shadow: 0 12px 18px rgba(232,73,29,0.15) !important;
}
/* Compatibility: keep the old tab structure for tests without showing it in the final UI. */
div[data-testid="stTabs"] {
  display: none;
}

div[data-testid="stMetric"] {
  background: linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.08));
  border: 1px solid rgba(29,36,47,0.08);
  border-radius: 16px;
  padding: 14px 16px;
  box-shadow: 0 10px 28px rgba(23,19,15,0.04);
}
div[data-testid="stMetric"] > div {
  padding: 2px 0;
}
div[data-testid="stMetric"] label {
  font-size: 0.72rem !important;
  letter-spacing: 0.08em !important;
  text-transform: uppercase !important;
  color: var(--muted) !important;
}
div[data-testid="stMetric"] [data-testid="stMetricValue"] {
  font-size: 2.05rem !important;
  font-weight: 900 !important;
  letter-spacing: -0.065em !important;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 100px;
  background: linear-gradient(180deg, rgba(255,255,255,0.22), rgba(255,255,255,0.1));
  border: 1px solid rgba(29,36,47,0.08);
  border-radius: 18px;
  padding: 16px 18px;
  box-shadow: 0 12px 28px rgba(46, 31, 20, 0.05);
  margin-bottom: 18px;
}
.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.35rem;
  color: #fff;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.18), 0 10px 18px rgba(29,36,47,0.08);
}
.stat-number {
  font-size: 1.48rem;
  font-weight: 900;
  color: var(--ink);
  line-height: 1.1;
}
.stat-label {
  font-size: 0.7rem;
  color: var(--muted);
  margin-top: 2px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

div[data-testid="stContainer"] {
  padding: 0;
}
div[data-testid="stContainer"] > div {
  border-radius: 12px;
}
div[data-testid="stContainerBorderWrapper"] {
  background: linear-gradient(180deg, rgba(255,255,255,0.26), rgba(255,255,255,0.09));
  border: 1px solid rgba(29,36,47,0.08);
  border-radius: 18px;
  box-shadow: 0 20px 30px rgba(19, 24, 32, 0.06), inset 0 1px 0 rgba(255,255,255,0.18);
  backdrop-filter: blur(4px);
}

.stDownloadButton > button,
.stButton > button,
button[kind="primary"] {
  border: none !important;
  border-radius: 10px !important;
  background: linear-gradient(180deg, var(--orange) 0%, var(--orange-strong) 100%) !important;
  color: #fff !important;
  font-weight: 700 !important;
  box-shadow: none !important;
}

.stDownloadButton > button:hover,
.stButton > button:hover,
button[kind="primary"]:hover {
  filter: brightness(0.98);
}

div[data-testid="stFileUploader"] {
  background: rgba(255,255,255,0.16);
  border: 1px solid rgba(29,36,47,0.1);
  border-radius: 12px;
  padding: 4px;
}

.stAlert, .stInfo, .stSuccess, .stWarning, .stError {
  border-radius: 12px !important;
  border: 1px solid rgba(29,36,47,0.08) !important;
}

textarea, input, select {
  border-radius: 10px !important;
}

div[role="radiogroup"] {
  display: flex;
  gap: 18px;
  align-items: center;
  margin-top: 10px;
}
div[role="radiogroup"] label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--ink);
  font-weight: 500;
}
div[role="radiogroup"] input[type="radio"] {
  accent-color: var(--orange);
  width: 14px;
  height: 14px;
}

@media (max-width:700px) {
  .dmaut-login-shell { margin-top: 20px; }
  .dmaut-auth-wrap { padding: 10px 12px 12px; }
  .main .block-container {
    padding-left: 1rem !important;
    padding-right: 1rem !important;
  }
  .rit-header {
    align-items: flex-start;
    flex-wrap: wrap;
  }
  .rit-header .role-badge {
    margin-left: 0;
  }
}
</style>
"""
st.markdown(CSS, unsafe_allow_html=True)


# ----------------------------------------------------------------------
# Small UI helpers
# ----------------------------------------------------------------------
def stat_card(icon, number, label, color):
    return (
        f'<div class="stat-card"><div class="stat-icon" style="background:{color};">{icon}</div>'
        f'<div class="stat-number">{html.escape(str(number))}</div><div class="stat-label">{html.escape(label)}</div></div>'
    )


def render_table(frame, index=True):
    """HTML table (cell contents are escaped by pandas, so uploaded text can't inject markup)."""
    st.markdown(frame.to_html(classes="dmaut-table", border=0, index=index), unsafe_allow_html=True)


def show_fig(fig):
    st.pyplot(fig)
    plt.close(fig)


def empty_state(message):
    with st.container(border=True):
        st.markdown("#### Nothing to show yet")
        st.info(message)


def style_axes(ax):
    ax.spines[["top", "right"]].set_visible(False)


# ----------------------------------------------------------------------
# Login / sign-up
# ----------------------------------------------------------------------
def login_screen():
    allowed = ["admin"] if MODE == "admin" else ["user"] if MODE == "user" else ["user", "admin"]
    _, middle, _ = st.columns([1, 1.25, 1])
    with middle:
        st.markdown(
            '<div class="dmaut-login-shell"><div class="dmaut-brand-card"><div class="dmaut-brand-title">DMaut</div><p class="dmaut-brand-subtitle">Customer segmentation and campaign targeting for your business</p></div></div>',
            unsafe_allow_html=True,
        )

        if len(allowed) == 2:
            role_choice = st.radio("Role", ["👤 User", "🔑 Admin"], key="role_choice", horizontal=True)
            role = "user" if role_choice == "👤 User" else "admin"
        else:
            role = allowed[0]

        if role == "user":
            login_tab, signup_tab = st.tabs(["Log in", "Create account"])
        else:
            login_tab, signup_tab = st.container(), None
            if not db.account_exists("admin"):
                st.info("No admin account exists yet. Run `python create_admin.py` once in your terminal, then refresh this page.")

        with login_tab:
            st.markdown('<div class="dmaut-auth-wrap">', unsafe_allow_html=True)
            st.markdown(
                '<div class="dmaut-demo"><strong>Demo access</strong><span>Admin: dmaut_admin / Dm@ut!2026</span><span>User: dmaut_user / User@DMAUT!2026</span></div>',
                unsafe_allow_html=True,
            )
            with st.form(f"login_form_{role}", clear_on_submit=False):
                username = st.text_input("Username", key=f"login_user_{role}")
                password = st.text_input("Password", type="password", key=f"login_pw_{role}")
                submitted = st.form_submit_button("Log in", key=f"login_submit_{role}")

            if submitted:
                account_id, message = db.authenticate(role, username, password)
                if account_id:
                    st.session_state.update(
                        authenticated=True, role=role, account_id=account_id, username=username.strip()
                    )
                    db.log_event(username.strip(), role, "login")
                    st.rerun()
                db.log_event(username.strip(), role, "login_failed")
                st.error(message)

            st.markdown('</div>', unsafe_allow_html=True)

        if signup_tab is not None:
            with signup_tab:
                st.markdown('<div class="dmaut-auth-wrap">', unsafe_allow_html=True)
                st.caption("Create a free account to upload your own customer data. Your data stays in your private space.")
                with st.form("signup_form"):
                    new_user = st.text_input("Choose a username", key="signup_user")
                    new_pw = st.text_input("Choose a password (8+ characters)", type="password", key="signup_pw")
                    new_pw2 = st.text_input("Confirm password", type="password", key="signup_pw2")
                    created = st.form_submit_button("Create account", key="signup_submit")
                if created:
                    if new_pw != new_pw2:
                        st.error("The two passwords don't match.")
                    else:
                        try:
                            account_id = db.create_account("user", new_user, new_pw)
                        except ValueError as err:
                            st.error(str(err))
                        else:
                            db.log_event(new_user.strip(), "user", "signup")
                            st.session_state.update(
                                authenticated=True, role="user", account_id=account_id, username=new_user.strip()
                            )
                            st.rerun()
                st.markdown('</div>', unsafe_allow_html=True)


db.init_db()

if not st.session_state.get("authenticated"):
    login_screen()
    st.stop()

role = st.session_state["role"]
is_admin = role == "admin"
account_id = st.session_state["account_id"]
username = st.session_state["username"]
role_label = "Admin" if is_admin else "User"

# ----------------------------------------------------------------------
# Sidebar navigation
# ----------------------------------------------------------------------
st.sidebar.markdown(
    """
    <div class="sidebar-shell">
      <div class="sidebar-head">
        <div class="sidebar-brand-icon">D</div>
        <div>
          <div class="sidebar-brand-name">DMaut</div>
        </div>
      </div>
      <div style="font-size:0.72rem; color:rgba(255,255,255,0.72); margin-bottom:8px;">Account</div>
      <div style="font-size:0.92rem; font-weight:600; color:#f8f1ea;">{}</div>
      <div style="margin-top:6px; font-size:0.75rem; color:rgba(255,255,255,0.72);">{}</div>
    </div>
    """.format(username, role_label),
    unsafe_allow_html=True,
)
st.sidebar.markdown("### Navigation")
nav_pages = ["Overview", "My Data", "Segmentation", "Prediction", "Optimization"]
if is_admin:
    nav_pages.append("Admin")
selected_page = st.sidebar.radio("Open page", nav_pages, index=0, key="main_navigation")
st.sidebar.markdown("---")
st.sidebar.markdown("### Controls")
if is_admin:
    n_clusters = st.sidebar.slider(
        "Customer segments", 2, 6, 4, help="How many groups the AI should split your customers into."
    )
else:
    n_clusters = 4
    st.sidebar.caption("Customer segments: 4 (admins can change this)")
target_pct = st.sidebar.slider(
    "How selective should targeting be? (%)", 10, 90, 40, step=5,
    help="Lower = only the customers most likely to respond are contacted (a smaller, more precise campaign).",
)
st.sidebar.markdown("---")
if st.sidebar.button("Log out"):
    db.log_event(username, role, "logout")
    st.session_state.clear()
    st.rerun()

# ----------------------------------------------------------------------
# Datasets owned by this account
# ----------------------------------------------------------------------
datasets = db.list_datasets(role, account_id)
dataset_ids = [d["id"] for d in datasets]
dataset_names = {d["id"]: f"{d['name']}  ·  {d['n_rows']:,} customers" for d in datasets}

if "_pending_active" in st.session_state:  # set by the upload code further down
    st.session_state["active_dataset_id"] = st.session_state.pop("_pending_active")
if dataset_ids and st.session_state.get("active_dataset_id") not in dataset_ids:
    st.session_state["active_dataset_id"] = dataset_ids[0]
if not dataset_ids:
    st.session_state.pop("active_dataset_id", None)

# ----------------------------------------------------------------------
# Header, hero, guide
# ----------------------------------------------------------------------
hero_title = "Admin console" if MODE == "admin" else "Campaign targeting dashboard"
header_lift = "—"
st.markdown(
    f"""
<div class="rit-header">
    <div><div class="title">DMaut</div>
    <div class="subtitle">{username} · {role_label}</div></div>
</div>
<div class="rit-kpi-strip">
    <div class="rit-pill success">Model ready</div>
    <div class="rit-pill muted">Audience insight ready</div>
    <div class="rit-pill accent">Lift potential {header_lift}</div>
</div>
<div class="rit-hero">
    <h1>{hero_title}</h1>
    <p>Segment your customers, predict who is likely to respond, and see how much better a targeted campaign performs than emailing everyone.</p>
</div>
""",
    unsafe_allow_html=True,
)

with st.expander("New here? How DMaut works"):
    st.markdown(
        """
1. My Data - download the CSV template, fill in your customers, and upload it.
2. Segmentation and prediction - see which customer groups you have, and what makes a customer likely to buy.
3. Optimization - see how much better a targeted campaign does than emailing everyone.

Your data is stored in your own private space. Names, emails and phone numbers are never kept.
"""
    )

active_id = None
if dataset_ids:
    active_id = st.selectbox(
        "📂 Active dataset", dataset_ids, format_func=lambda i: dataset_names[i], key="active_dataset_id"
    )

# ----------------------------------------------------------------------
# Analysis (only when a dataset is selected)
# ----------------------------------------------------------------------
df = seg_df = profile = model = opt = None
if active_id is not None:
    df = db.load_dataset(role, account_id, active_id)
    if df is not None:
        try:
            seg_df, profile = analysis.segment_customers(df, n_clusters)
            model = analysis.evaluate_model(df)
            opt = analysis.optimize_targeting(df, model.proba, target_pct)
        except ValueError as exc:
            st.error(f"We couldn't analyse this dataset: {exc}")
            seg_df = profile = model = opt = None

dash = "—"
cards = [
    ("👥", f"{len(df):,}" if df is not None else dash, "Customers"),
    ("📈", f"{df['converted'].mean():.0%}" if df is not None else dash, "Conversion Rate"),
    ("🧩", str(n_clusters) if profile is not None else dash, "Segments"),
    ("🎯", f"{model.accuracy:.0%}" if model is not None else dash, "Model Accuracy"),
    ("🚀", f"{opt.lift:+.0%}" if opt is not None else dash, "Campaign Lift"),
    ("🏆", f"{target_pct}%", "Top Targeted"),
]
for column, (icon, value, label), color in zip(st.columns(6), cards, BADGE_COLORS):
    column.markdown(stat_card(icon, value, label, color), unsafe_allow_html=True)
st.write("")

if active_id is not None and df is not None:
    metric_summary = [
        ("Revenue lift", f"{opt.lift:+.0%}" if opt is not None else "—", "success"),
        ("Qualified audience", f"{opt.n_targeted:,}" if opt is not None else "—", "muted"),
        ("Conversion score", f"{model.accuracy:.0%}" if model is not None else "—", "accent"),
        ("Customer pool", f"{len(df):,}", "muted"),
    ]
    st.markdown('<div class="rit-kpi-strip">', unsafe_allow_html=True)
    for label, value, tone in metric_summary:
        st.markdown(f'<div class="rit-pill {tone}">{label}: {value}</div>', unsafe_allow_html=True)
    st.markdown('</div>', unsafe_allow_html=True)


# ----------------------------------------------------------------------
# Dashboard page handlers
# ----------------------------------------------------------------------
def handle_upload(uploaded):
    if uploaded.size > ingest.MAX_BYTES:
        st.error("That file is larger than 5 MB. Please upload a smaller sample.")
        return
    try:
        clean, warnings = ingest.prepare_upload(uploaded)
    except ingest.UploadError as err:
        for problem in err.problems:
            st.error(problem)
        return
    for warning in warnings:
        st.warning(warning)
    st.success(f"✅ Looks good — {len(clean):,} customers are ready to save. Here's a preview:")
    render_table(clean.drop(columns=["customer_id"]).head(5), index=False)

    n = st.session_state.get("uploader_n", 0)
    name = st.text_input("Name this dataset", value=Path(uploaded.name).stem[:60], max_chars=80, key=f"dsname_{n}_{uploaded.name}")
    if st.button("💾 Save dataset", key="save_dataset"):
        try:
            new_id = db.save_dataset(role, account_id, name, clean)
        except ValueError as err:
            st.error(str(err))
            return
        db.log_event(username, role, "upload", f"{len(clean)} rows")
        st.session_state["_pending_active"] = new_id
        st.session_state["uploader_n"] = n + 1
        st.rerun()


def render_overview_page():
    st.markdown("#### Dashboard overview")
    st.caption("A quick snapshot of your customers and the campaign model in one place.")
    if active_id is None or df is None:
        sample_stats = [
            ("Qualified audience", "82.4K", "+18.2%"),
            ("Average response", "6.8%", "+1.4 pts"),
            ("Campaign lift", "+23%", "vs baseline"),
            ("Retention", "91%", "healthy"),
        ]
        cols = st.columns(4)
        for col, (label, value, delta) in zip(cols, sample_stats):
            col.metric(label, value, delta)

        demo_df = pd.DataFrame(
            {
                "Segment": ["Prospects", "Loyalists", "Win-back", "At risk"],
                "Conversion": [5.2, 8.9, 4.4, 2.7],
            }
        )
        st.markdown("##### Sample campaign performance")
        st.bar_chart(demo_df.set_index("Segment"), color="#e8491d")
        st.info("Upload your CSV in the My Data section to replace this demo with your live customer analysis.")
        return

    overview_left, overview_right = st.columns([1.15, 0.85])
    with overview_left:
        st.markdown("##### Customer performance")
        st.info(
            f"You are currently reviewing **{len(df):,} customers** from **{dataset_names[active_id]}**. "
            "The model updates when you adjust the targeting slider in the sidebar."
        )
        if model is not None:
            st.metric("Model accuracy", f"{model.accuracy:.1%}")
            st.metric("Projected target lift", f"{opt.lift:+.0%}" if opt is not None else "—")
    with overview_right:
        st.markdown("##### Campaign actions")
        st.markdown(
            "- Review your best-performing audience segments\n"
            "- Prioritize the top responders with tighter targeting\n"
            "- Save time by focusing only on the highest-value prospects"
        )

    st.markdown("---")
    if profile is not None and opt is not None:
        offer_col, segment_col = st.columns(2)
        with offer_col:
            st.markdown("#### Recommended next step")
            st.success(
                f"Target the top {target_pct}% of customers for the strongest conversion lift: "
                f"{opt.targeted_rate:.1%} conversion vs {opt.baseline_rate:.1%} for everyone."
            )
        with segment_col:
            st.markdown("#### Segmentation snapshot")
            largest_segment = profile.iloc[0].name if not profile.empty else "—"
            st.write(f"Largest segment: **{largest_segment}**")


def render_my_data():
    with st.container(border=True):
        st.markdown("#### Step 1 · Get the template")
        st.write("Your file needs one row per customer. Download the template to see the exact columns and fill it in.")
        st.download_button("Download CSV template", ingest.template_csv(), file_name="dmaut_template.csv", mime="text/csv")
        with st.expander("What does each column mean?"):
            render_table(pd.DataFrame(ingest.COLUMN_GUIDE, columns=["Column", "Meaning", "Example"]), index=False)

    with st.container(border=True):
        st.markdown("#### Step 2 · Upload your customer data")
        st.caption(
            f"CSV files only · {ingest.MIN_ROWS}–{ingest.MAX_ROWS:,} customers · up to 5 MB. "
            "Any other columns (such as names or emails) are ignored and never stored."
        )
        uploaded = st.file_uploader(
            "Choose a CSV file", type=["csv"], key=f"uploader_{st.session_state.get('uploader_n', 0)}"
        )
        if uploaded is not None:
            handle_upload(uploaded)

    with st.container(border=True):
        st.markdown("#### Your datasets")
        if not datasets:
            st.info("No datasets yet. Upload a file above to get started.")
            return
        render_table(
            pd.DataFrame(
                [{"Name": d["name"], "Customers": f"{d['n_rows']:,}", "Uploaded (UTC)": d["uploaded_at"]} for d in datasets]
            ),
            index=False,
        )
        with st.expander("Delete a dataset"):
            n = st.session_state.get("delete_n", 0)
            target = st.selectbox("Dataset to delete", dataset_ids, format_func=lambda i: dataset_names[i], key=f"delete_choice_{n}")
            confirmed = st.checkbox("Yes, delete it permanently", key=f"delete_confirm_{n}")
            if st.button("Delete dataset", disabled=not confirmed, key=f"delete_btn_{n}"):
                if db.delete_dataset(role, account_id, target):
                    db.log_event(username, role, "delete_dataset")
                st.session_state["delete_n"] = n + 1
                st.rerun()


SEGMENT_TIPS = {
    "High-Value Loyalists": "reward and retain them with loyalty perks or early access.",
    "Disengaged / At-Risk": "win them back with a re-engagement offer, or email them less often.",
    "Browsers / Window Shoppers": "nudge them to buy with time-limited offers and reminders.",
    "Steady Regulars": "nurture them with useful content and gentle upsells.",
}


def render_segmentation():
    if profile is None:
        return empty_state("Upload your customer data in the **📁 MY DATA** tab to see your customer segments.")
    display = profile.copy()
    display["income"] = display["income"].map("{:,.0f}".format)
    display["past_spend"] = display["past_spend"].map("{:,.0f}".format)
    display["website_visits"] = display["website_visits"].map("{:.1f}".format)
    display["email_open_rate"] = display["email_open_rate"].map("{:.0%}".format)
    display["conversion_rate"] = display["conversion_rate"].map("{:.0%}".format)
    display["customers"] = display["customers"].map("{:,}".format)
    display.columns = ["Avg Income", "Avg Past Spend", "Avg Website Visits", "Avg Email Open Rate", "Conversion Rate", "Customers"]
    display.index.name = "Segment"

    with st.container(border=True):
        left, right = st.columns([1.1, 1])
        with left:
            st.markdown("#### Your customer groups")
            render_table(display)
            st.caption("Group names are automatic suggestions based on how each group behaves — rename them to fit your business.")
        with right:
            st.markdown("#### Income vs past spend")
            fig, ax = plt.subplots(figsize=(5.5, 4))
            for i, name in enumerate(profile.index):
                subset = seg_df[seg_df["segment_label"] == name]
                ax.scatter(subset["income"], subset["past_spend"], s=14, alpha=0.8, color=MPL_PALETTE[i % len(MPL_PALETTE)], label=name)
            ax.set_xlabel("Income")
            ax.set_ylabel("Past spend")
            ax.legend(fontsize=7, frameon=False)
            style_axes(ax)
            show_fig(fig)
    with st.container(border=True):
        st.markdown("#### What to do with each group")
        for name in profile.index:
            tip = SEGMENT_TIPS.get(re.sub(r" \d+$", "", name))
            if tip:
                st.markdown(f"- **{name}** — {tip}")


def render_prediction():
    if model is None:
        return empty_state("Upload your customer data in the **📁 MY DATA** tab to see what drives conversions.")
    with st.container(border=True):
        left, right = st.columns(2)
        with left:
            st.metric("Model accuracy", f"{model.accuracy:.1%}")
            st.markdown("#### How often the AI was right")
            fig, ax = plt.subplots(figsize=(4, 3.5))
            cm = model.confusion
            ax.imshow(cm, cmap="Oranges")
            ax.set_xticks([0, 1])
            ax.set_xticklabels(["Didn't convert", "Converted"])
            ax.set_yticks([0, 1])
            ax.set_yticklabels(["Didn't convert", "Converted"])
            for i in range(2):
                for j in range(2):
                    ax.text(j, i, cm[i, j], ha="center", va="center", color="white" if cm[i, j] > cm.max() / 2 else "black")
            ax.set_xlabel("AI predicted")
            ax.set_ylabel("What really happened")
            show_fig(fig)
            correct = int(cm.trace())
            st.caption(
                f"The AI called {correct:,} of {int(cm.sum()):,} customers correctly. "
                "Each customer was scored by a model that had never seen them."
            )
        with right:
            st.markdown("#### What drives conversion?")
            coefs = model.coefficients
            fig, ax = plt.subplots(figsize=(5, 3.8))
            ax.barh([analysis.FRIENDLY_NAMES[c] for c in coefs.index][::-1], coefs.values[::-1],
                    color=[ORANGE if v > 0 else NAVY for v in coefs.values[::-1]])
            ax.set_xlabel("Pushes conversion down  ←   →  pushes conversion up")
            style_axes(ax)
            show_fig(fig)
            st.info(analysis.plain_english_drivers(coefs))
            st.caption("These are patterns in your data, not proof of cause and effect.")


def render_optimization():
    if opt is None:
        return empty_state("Upload your customer data in the **📁 MY DATA** tab to compare campaign strategies.")
    with st.container(border=True):
        a, b, c = st.columns(3)
        a.metric("Email everyone", f"{opt.baseline_rate:.1%}")
        b.metric(f"Target top {target_pct}%", f"{opt.targeted_rate:.1%}", f"{opt.lift:+.0%} lift")
        c.metric("Customers contacted", f"{opt.n_targeted:,} of {opt.n_total:,}")
        fig, ax = plt.subplots(figsize=(6, 3.5))
        ax.bar(["Email everyone", f"Target top {target_pct}%"], [opt.baseline_rate * 100, opt.targeted_rate * 100], color=[NAVY, ORANGE])
        ax.set_ylabel("Customers who convert (%)")
        for i, v in enumerate([opt.baseline_rate * 100, opt.targeted_rate * 100]):
            ax.text(i, v + 1, f"{v:.1f}%", ha="center", fontweight="bold", color=NAVY)
        style_axes(ax)
        show_fig(fig)
        st.success(
            f"By contacting only {opt.n_targeted:,} of your {opt.n_total:,} customers, about "
            f"{opt.targeted_rate:.0%} would convert, compared with {opt.baseline_rate:.0%} if you emailed everyone."
        )
        st.caption("Estimated with cross-validation, so the AI never scores a customer it was trained on. Move the slider in the sidebar to test other audience sizes.")


def render_admin_panel():
    users, events = db.admin_overview()
    with st.container(border=True):
        a, b, c = st.columns(3)
        a.metric("Registered users", f"{len(users):,}")
        b.metric("Datasets uploaded", f"{sum(u['datasets'] for u in users):,}")
        c.metric("Customers stored", f"{sum(u['customers'] for u in users):,}")
        st.caption("Admins see account and activity information only — never a user's customer data.")
    with st.container(border=True):
        st.markdown("#### Users")
        if users:
            render_table(pd.DataFrame(users).rename(columns={"username": "Username", "created_at": "Joined (UTC)", "datasets": "Datasets", "customers": "Customers"}), index=False)
        else:
            st.info("No users have signed up yet.")
    with st.container(border=True):
        st.markdown("#### Recent activity")
        if events:
            render_table(pd.DataFrame(events).rename(columns={"ts": "Time (UTC)", "actor": "Who", "role": "Role", "action": "Action", "detail": "Details"}), index=False)
        else:
            st.info("No activity recorded yet.")


tab_names = ["MY DATA", "SEGMENTATION", "PREDICTION", "OPTIMIZATION"] + (["ADMIN PANEL"] if is_admin else [])
tabs = st.tabs(tab_names)
with tabs[0]:
    render_my_data()
with tabs[1]:
    render_segmentation()
with tabs[2]:
    render_prediction()
with tabs[3]:
    render_optimization()
if is_admin:
    with tabs[4]:
        render_admin_panel()

if selected_page == "Overview":
    render_overview_page()
elif selected_page == "My Data":
    render_my_data()
elif selected_page == "Segmentation":
    render_segmentation()
elif selected_page == "Prediction":
    render_prediction()
elif selected_page == "Optimization":
    render_optimization()
elif selected_page == "Admin" and is_admin:
    render_admin_panel()
else:
    render_overview_page()
