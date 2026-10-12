# DMaut — AI-Enabled Marketing Automation & Campaign Optimization

DMaut lets a business upload its own customer data and then uses machine learning to
**group customers into segments**, **predict who is likely to respond to a campaign**, and
**show how much better a targeted campaign performs than emailing everyone**.

It is a focused demonstration of predictive AI for marketing (the capability that
rule-based tools such as Mautic are only starting to add). It is **not** an email-sending
platform: there is no message delivery or CRM.

## Features

- **Upload your own data** (CSV) — checked and cleaned with friendly, plain-language errors
- **Automatic segmentation** — K-Means groups customers by behaviour, with suggested actions per group
- **Conversion prediction** — Logistic Regression, explained in plain English
- **Campaign optimization** — compares "email everyone" with "target the top X%" using cross-validated scores
- **Two roles** — Users (upload and explore their own data) and Admins (plus an admin panel)
- **Two separate databases** — `data/user.db` and `data/admin.db`
- **Optional two-site mode** — run a customer site and an admin console as separate apps

## Setup

```bash
python -m venv venv
venv\Scripts\activate            # Windows   (Mac/Linux: source venv/bin/activate)
pip install -r requirements.txt

python create_admin.py           # once: create an admin account
streamlit run app.py
```

Optionally copy `.env.example` to `.env` and set `ID_SALT` to a long random string.
On the first run the app writes `.streamlit/config.toml` (light theme, 5 MB upload limit); stop it with Ctrl+C and start it again once.

### Separate user site and admin console

Run these in two terminals (PowerShell shown):

```powershell
$env:DMAUT_MODE="user";  streamlit run app.py --server.port 8501   # customers' site
$env:DMAUT_MODE="admin"; streamlit run app.py --server.port 8502   # admin console
```

Each site shows only its own login page, and credentials for one role never work on the other.
Behind a real domain, these become e.g. `app.example.com` and `admin.example.com`.

## Data format

One row per customer. Download the template from the app's **My Data** tab.

| Column | Meaning |
|---|---|
| `customer_id` (optional) | Any ID; stored only as a keyed one-way hash |
| `age` | 0–120 |
| `income` | 0 or more |
| `past_spend` | 0 or more |
| `website_visits` | 0 or more |
| `email_open_rate` | between 0 and 1 |
| `days_since_last_purchase` | 0 or more |
| `converted` | 1 = responded to your last campaign, 0 = did not |

Limits: 100–20,000 rows, 5 MB, at least 10 customers of each outcome. Extra columns
(names, emails, phone numbers) are ignored and never stored.
`sample_business_data.csv` is included for trying the upload.

## Project structure

```
app.py            Streamlit interface (login, upload, dashboard, admin panel)
db.py             Storage layer: two SQLite databases, accounts, datasets, audit log
ingest.py         Upload validation and anonymisation
analysis.py       Segmentation, cross-validated model, campaign simulation
create_admin.py   One-time admin account creation
test_dmaut.py     Automated tests (python -m unittest -v)
ai_marketing_demo.py   Original standalone experiment (generates its own sample data)
```

## Security

- Passwords stored only as salted PBKDF2-HMAC-SHA256 hashes (600,000 iterations); constant-time comparison
- Accounts lock for 15 minutes after 5 failed logins; unknown usernames take the same time as known ones
- All SQL is parameterised; every dataset read or delete is scoped to its owner
- Admins see account and activity information only, never a user's customer rows
- Customer IDs are keyed-hashed; uploaded personal columns are dropped before storage
- Upload limits on size, rows and dataset count; tables render with HTML escaping
- Admin-only audit log of logins, uploads and deletions
- `.env`, `data/` and `*.db` are git-ignored so secrets and customer data are never committed

## How results are measured

The model and campaign lift are evaluated with 5-fold cross-validation: every customer is
scored by a model that never saw them during training, so the numbers are not flattered by
memorisation. Logistic Regression is used for interpretability (you can say *why* a customer
scores high); K-Means for scalable, rule-free segmentation. Both use standardised features.

## Testing

```bash
python -m unittest -v
```

## Limitations and future work

- SQLite on one machine — fine for a demo or small deployment, not for large multi-server use
- Sessions are not encrypted unless served over HTTPS (deploy behind TLS)
- No password reset flow or email verification yet
- Segment names are heuristic suggestions; the model predicts patterns, not causes
- Ideas: model comparison (e.g. random forest), send-time optimisation, exporting the target list, a REST API
