# DMAUT AI — Marketing Automation & Campaign Platform

An advanced AI-powered marketing automation web application built with a high-contrast monochrome design system, multi-model AI integration (Google Gemini Studio, OpenAI, Groq), isolated per-user sessions, RFM customer segmentation, event-driven marketing automations, and predictive campaign optimization.

---

## 🌟 Key Updates in Version 2.1

### 1. Mandatory Auth Wall & Per-User Data Isolation
- The app opens with a dedicated **Sign-In / Sign-Up landing page**.
- Every user has their own **isolated session and private database sandbox**. User A can never see or modify User B's campaigns, segments, automations, or logs.
- New accounts start **completely fresh and clean** (no unwanted mock pollution).

### 2. Business vs. Personal Account Tiers
During registration, users can choose between two purpose-built account types:
- **🏢 Business Account**:
  - Full enterprise access to all 6 modules: AI Content Generator, Multi-Channel Campaign Manager with budget tracking, Smart CSV Customer Segmentation with RFM auto-clustering, Marketing Automation with simulation runner, Campaign Optimization Assistant (A/B testing), and full Revenue Matrix Analytics.
- **👤 Personal Account**:
  - Distraction-free workspace tailored for solo creators, newsletter authors, and freelancers: AI Content Generator, Simplified Campaign Manager, and Reach Analytics.

### 3. Sidebar Bottom Menus (Settings & Account)
- **Settings Menu**:
  - **Themes**: Switch between Dark, Light (White), and Auto/System modes.
  - **AI Model Keys**: Configure Google Gemini Studio (`gemini-2.0-flash`, `gemini-1.5-pro`, `gemini-1.5-flash`), OpenAI, or Groq Cloud credentials with built-in connection testing.
  - **Walkthrough Guide**: Replay or toggle the onboarding tutorial.
  - **Workspace Snapshot**: Download full JSON workspace backups.
- **Account Menu**:
  - Edit Display Name / Username.
  - Change Email Address.
  - Change Password.
  - Switch Account Tier (Personal $\leftrightarrow$ Business).
  - Permanent Account Deletion (completely removes user and data from the server).
  - Sign Out.

### 4. Interactive Startup Onboarding Tour
- Professional guided walkthrough explaining how to use all 6 modules.
- Persistent checkbox to disable on future startups, relaunchable at any time from Settings or the top header.

### 5. Collapsible Sidebar
- High-productivity expand/collapse toggle for compact icon-only view or expanded view.

---

## 🎯 The 6 Core Modules

1. **AI Marketing Content Generator**: Promotional emails, ad copies, headlines, and catchy subject lines with 6 brand tones, regeneration, copy-to-clipboard, and direct "Save as Campaign".
2. **Campaign Manager**: Multi-channel marketing campaigns (Email, Google Ads, SMS, Social Media) with schedule dates, segment bindings, and live metrics.
3. **Smart Customer Segmentation**: CSV spreadsheet parser with RFM behavioral clustering into Loyal VIPs, Active, New, and At-Risk segments.
4. **Simple Marketing Automation**: Event-driven $\text{Trigger} \rightarrow \text{Condition} \rightarrow \text{Action}$ builder with live simulation runner and real-time execution audit logs.
5. **Campaign Optimization Assistant**: Side-by-side A/B test comparison with statistical lift calculation, friction point detection, and winning variant deployment.
6. **Analytics Dashboard**: High-level KPIs, 7-day timeline trends, channel revenue breakdown, and on-demand AI strategic recommendations.

---

## 🚀 Getting Started

### 1-Click Launch (Windows)
Double-click `run_app.bat` in the root folder. Both backend (Port 5000) and frontend (Port 5173) will launch, and your default browser will open automatically.

### Manual Commands

**Terminal 1 — Backend (Port 5000):**
```bash
cd backend
npm install
npm start
```

**Terminal 2 — Frontend (Port 5173):**
```bash
cd frontend
npm install
npm run dev
```

HEAD

## 📂 Project Structure
```
app.py                    Interactive Streamlit dashboard & Plotly charts
core_engine.py            Core ML engine (K-Means, Logistic Regression, Random Forest, ROI simulations)
test_dmaut.py             Automated test suite
requirements.txt          Project dependencies
sample_business_data.csv  Sample marketing records
.env.example              Environment configuration template
.streamlit/config.toml    Custom Streamlit theme configuration
```
Visit [http://localhost:5173](http://localhost:5173) in your browser.
d84b4bb3f0e8345e8473cb85a3f1434443f58d8c