# DMaut — AI-Enabled Marketing Automation & Campaign Optimization

DMaut is a streamlined, high-performance marketing intelligence platform that uses Machine Learning to:
1. **Segment customers into behavioral personas** using unsupervised K-Means clustering.
2. **Predict campaign conversion probability** using cross-validated machine learning (Logistic Regression / Random Forest).
3. **Simulate campaign ROI and selective targeting** comparing blanket mass email blasts with AI high-propensity targeting.
4. **Interactive Customer Propensity Predictor** to simulate individual customer conversion likelihood in real time with an interactive gauge.

---

## 🚀 Quick Setup & Run

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Run the Interactive Streamlit App
```bash
streamlit run app.py
```
*The web interface will automatically open at `http://localhost:8501`.*

---

## 🧩 Key Features

- **📊 Modern Glassmorphic Dark UI**: Built with Streamlit, Plotly, and custom Plus Jakarta Sans / Outfit typography.
- **👥 Behavioral Clustering**: Automatically segments audiences into actionable personas (*High-Value Loyalists*, *Window Shoppers*, *Disengaged / At-Risk*, *Steady Buyers*).
- **🧠 Transparent Conversion AI**: Explains what drives purchases (feature importances) and validates accuracy via 5-Fold Stratified Cross-Validation.
- **🚀 Campaign Financial Simulator**: Enter your cost per message and average order value to calculate exact cost savings, net profit, and ROI gains.
- **🎯 1-Click Audience Export**: Download high-propensity target lists (CSV) directly ready for Klaviyo, Mailchimp, or Meta Custom Audiences.
- **🔮 Real-Time Customer Tester**: Tweak age, income, past spend, web visits, open rates, and recency sliders to test conversion probabilities interactively.

---

## 🧪 Testing

Run the automated test suite with Python's standard unittest:
```bash
python -m unittest test_dmaut.py -v
```

---

## 📂 Project Structure
```
app.py            Interactive Streamlit dashboard & Plotly charts
core_engine.py    Core ML engine (K-Means, Logistic Regression, Random Forest, ROI simulations)
test_dmaut.py     Automated test suite
requirements.txt  Project dependencies
sample_business_data.csv  Sample marketing records
```
