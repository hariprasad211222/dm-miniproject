# DMAUT AI — Marketing Automation & Campaign Platform

A complete, modern AI-powered marketing automation web application built with a high-contrast monochrome design system, multi-model AI integration (Google Gemini Studio, OpenAI, Groq), RFM customer segmentation, campaign management, automated triggers, and predictive optimization.

---

## 🌟 Key Features

### 1. AI Marketing Content Generator
- **Multi-Format Generation**: Promotional Emails, Meta/Google Ad Copies, High-Converting Headlines, and Catchy Subject Lines.
- **Tone Personalization**: Switch effortlessly between *Professional*, *Persuasive*, *Urgent / FOMO*, *Casual & Friendly*, *Luxury & Premium*, and *Witty & Bold*.
- **Direct Actions**: Instant copy-to-clipboard, one-click regenerate, and **"Save as Campaign"** to automatically pipe generated copy into the Campaign Manager.

### 2. Campaign Manager
- **Full Lifecycle Control**: Create, edit, save, duplicate, schedule, and activate marketing campaigns.
- **Multi-Channel Delivery**: Dedicated workflows for Email, Google Ads, SMS, and Social Media.
- **Audience & Metric Tracking**: Links campaigns to specific customer segments with live delivery stats (sent, opened, clicks, conversions, and attributed revenue).

### 3. Smart Customer Segmentation
- **CSV Data Import**: Drag-and-drop or select any customer CSV file with automatic header parsing.
- **RFM Auto-Clustering**: Automatically groups customers based on Recency, Frequency, and Monetary scores:
  - 👑 **Loyal VIPs**: High lifetime spend, frequent repeat purchases, high engagement.
  - ⚡ **Active Customers**: Consistent recent activity and healthy email open rates.
  - ✨ **New Signups**: First-time buyers and accounts opened in the last 30 days.
  - ⚠️ **Inactive / At-Risk**: Customers with $> 60$ days inactivity for win-back campaigns.
  - 💎 **High Spenders**: Top revenue contributors with high average order values.
- **Interactive Tools**: Full table search & filtering, CSV export of segmented subsets, and a direct **"Campaign for Segment"** button.
- **Sample Data**: Built-in sample CSV generator and one-click demo data reset.

### 4. Simple Marketing Automation
- **Event-Driven Workflows**: Visual $\text{Trigger} \rightarrow \text{Condition} \rightarrow \text{Action}$ builder.
- **Prebuilt Templates**:
  - *New Signup Welcome Sequence*
  - *45-Day Inactive Customer Re-Engagement*
  - *VIP Milestone Reward on \$5,000 Spend*
  - *Abandoned Cart Recovery SMS*
- **Active / Paused Toggles**: Enable or disable any workflow with a single click.
- **Live Simulation Test Runner**: Dispatches active rules across the current customer base and writes to the real-time **Execution Audit Log**.

### 5. Campaign Optimization Assistant (A/B Testing)
- **Side-by-Side Creative Comparison**: Compare Variant A vs. Variant B headlines, subject lines, tone, and performance stats.
- **Benchmark Presets**: Preloaded test scenarios (*Urgency vs. Social Proof*, *Direct Discount vs. Value Prop*).
- **AI Analysis & Scoring**: Evaluates audience friction points, computes statistical conversion lift, provides a confidence score, and outlines an actionable implementation checklist.
- **Instant Deployment**: Deploy the winning variant straight to an Active campaign with 1 click.

### 6. Analytics Dashboard
- **Key Performance Indicators**: Total active campaigns, audience reach, average engagement rate, overall conversion rate, and tracked revenue.
- **Interactive Monochrome Charts**:
  - 7-Day Performance Timeline (Sent vs. Opens)
  - Revenue Share by Marketing Channel
  - Customer Segment Value & Conversion Matrix
- **AI Strategic Recommendations**: On-demand AI synthesis that inspects current metrics and suggests 4 tactical growth experiments with estimated lift percentages.

---

## 🎨 Theme & Monochrome Design System
- **Three Theme Modes**:
  - **Dark**: High-contrast obsidian dark palette.
  - **Light (White)**: Clean, high-legibility crisp light palette.
  - **System (Auto)**: Automatically synchronizes with your operating system appearance (`prefers-color-scheme`).
- **Monochrome Styling**: Sleek black & white aesthetic inspired by Apple, Linear, and Vercel with crisp typography and responsive Lucide iconography.

---

## 🤖 AI Models & Provider Credentials

DMAUT AI is built to work seamlessly with:
1. **Google Gemini AI Studio** (Recommended):
   - `gemini-2.0-flash` (Ultra-fast, responsive)
   - `gemini-1.5-pro` (Deep reasoning & copy strategy)
   - `gemini-1.5-flash` (Balanced performance)
2. **OpenAI**:
   - `gpt-4o-mini`
   - `gpt-4o`
3. **Groq Cloud**:
   - `llama-3.3-70b-versatile`
4. **Built-in Smart Heuristic Engine**:
   - Zero-downtime offline fallback: if no API key is supplied or if network is unavailable, the application uses smart deterministic marketing heuristics so every feature works reliably right out of the box!

> **How to configure your API Key**:
> Click the **"AI Model Keys"** button in the top navigation bar, select your provider, paste your API key, and test the connection. Keys are safely stored locally in your browser session.

---

## 🔐 Authentication & Session Persistence
User sessions are managed with REST endpoints and persisted in browser `localStorage`.

### Quick Demo Logins:
- **Admin**: `admin@marketing.ai` / `password123`
- **Marketer**: `marketer@company.com` / `password123`
*(Or click "Admin Demo" / "Marketer Demo" in the sign-in modal for 1-click login!)*

---

## 🚀 Getting Started

### 1-Click Launch (Windows)
Double-click `run_app.bat` in the project root folder. It starts both backend and frontend servers and launches your browser at `http://localhost:5173`.

### Manual Startup

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

Open your browser at `http://localhost:5173`.
