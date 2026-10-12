"""DMaut storage layer: two separate SQLite databases."""
from __future__ import annotations

import contextlib
import hashlib
import hmac
import os
import re
import secrets
import shutil
import sqlite3
import time
from pathlib import Path

import pandas as pd

from ingest import REQUIRED_COLUMNS

ROLES = ("admin", "user")

PBKDF2_ITERATIONS = 600_000
MIN_PASSWORD_LEN = 8
MAX_PASSWORD_LEN = 128
MAX_FAILED_ATTEMPTS = 5
LOCKOUT_SECONDS = 15 * 60
MAX_DATASETS_PER_ACCOUNT = 5

_USERNAME_RE = re.compile(r"^[A-Za-z0-9_.-]{3,32}$")
_DUMMY_SALT = secrets.token_hex(16)

_CUSTOMER_COLS = ["customer_id"] + REQUIRED_COLUMNS
_INSERT_CUSTOMER_SQL = (
    "INSERT INTO customers (dataset_id, " + ", ".join(_CUSTOMER_COLS) + ") VALUES ("
    + ", ".join("?" * (len(_CUSTOMER_COLS) + 1)) + ")"
)
_SELECT_CUSTOMER_SQL = "SELECT " + ", ".join(_CUSTOMER_COLS) + " FROM customers WHERE dataset_id = ?"

_SCHEMA = [
    """CREATE TABLE IF NOT EXISTS accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE COLLATE NOCASE,
        salt TEXT NOT NULL,
        pw_hash TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        failed_attempts INTEGER NOT NULL DEFAULT 0,
        locked_until REAL NOT NULL DEFAULT 0,
        disabled INTEGER NOT NULL DEFAULT 0
    )""",
    """CREATE TABLE IF NOT EXISTS datasets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        owner_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        n_rows INTEGER NOT NULL,
        uploaded_at TEXT NOT NULL DEFAULT (datetime('now'))
    )""",
    """CREATE TABLE IF NOT EXISTS customers (
        dataset_id INTEGER NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
        customer_id TEXT,
        age REAL, income REAL, past_spend REAL, website_visits REAL,
        email_open_rate REAL, days_since_last_purchase REAL,
        converted INTEGER NOT NULL
    )""",
    "CREATE INDEX IF NOT EXISTS idx_customers_dataset ON customers(dataset_id)",
    "CREATE TABLE IF NOT EXISTS schema_version (name TEXT PRIMARY KEY, version INTEGER NOT NULL)",
]

_AUDIT_SCHEMA = """CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ts TEXT NOT NULL DEFAULT (datetime('now')),
    actor TEXT, role TEXT, action TEXT, detail TEXT
)"""


def _db_path(role: str) -> Path:
    if role not in ROLES:
        raise ValueError("Unknown role.")
    base = Path(os.environ.get("DMAUT_DATA_DIR") or Path(__file__).resolve().parent / "data")
    return base / f"{role}.db"


@contextlib.contextmanager
def _connect(role: str):
    path = _db_path(role)
    path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(path, timeout=10)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    try:
        with conn:
            yield conn
    finally:
        conn.close()


def _migrate(conn: sqlite3.Connection) -> None:
    conn.execute("CREATE TABLE IF NOT EXISTS schema_version (name TEXT PRIMARY KEY, version INTEGER NOT NULL)")
    current = conn.execute("SELECT version FROM schema_version WHERE name = 'main'").fetchone()
    version = int(current[0]) if current else 0
    columns = [row[1] for row in conn.execute("PRAGMA table_info(accounts)").fetchall()]
    migrations = {
        1: "ALTER TABLE accounts ADD COLUMN disabled INTEGER NOT NULL DEFAULT 0",
    }
    for step in range(version + 1, max(migrations, default=version) + 1):
        stmt = migrations.get(step)
        if stmt and (step == 1 and "disabled" not in columns):
            conn.execute(stmt)
            columns.append("disabled")
    conn.execute(
        "INSERT INTO schema_version(name, version) VALUES('main', ?) ON CONFLICT(name) DO UPDATE SET version=excluded.version",
        (max(migrations, default=version),),
    )


def init_db() -> None:
    """Create both databases (and their tables) if they don't exist yet."""
    for role in ROLES:
        with _connect(role) as conn:
            for statement in _SCHEMA:
                conn.execute(statement)
            if role == "admin":
                conn.execute(_AUDIT_SCHEMA)
            _migrate(conn)


def _hash_password(password: str, salt_hex: str) -> str:
    return hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), bytes.fromhex(salt_hex), PBKDF2_ITERATIONS
    ).hex()


def _validate_password(password: str) -> None:
    if not (MIN_PASSWORD_LEN <= len(password or "") <= MAX_PASSWORD_LEN):
        raise ValueError(f"Password must be {MIN_PASSWORD_LEN}-{MAX_PASSWORD_LEN} characters long.")


def create_account(role: str, username: str, password: str) -> int:
    username = (username or "").strip()
    if not _USERNAME_RE.match(username):
        raise ValueError("Username must be 3-32 characters: letters, numbers, dot, dash or underscore.")
    _validate_password(password)
    salt = secrets.token_hex(16)
    pw_hash = _hash_password(password, salt)
    try:
        with _connect(role) as conn:
            cur = conn.execute(
                "INSERT INTO accounts (username, salt, pw_hash, disabled) VALUES (?, ?, ?, 0)",
                (username, salt, pw_hash),
            )
            return cur.lastrowid
    except sqlite3.IntegrityError:
        raise ValueError("That username is already taken.")


def account_exists(role: str) -> bool:
    with _connect(role) as conn:
        return conn.execute("SELECT 1 FROM accounts LIMIT 1").fetchone() is not None


def authenticate(role: str, username: str, password: str):
    """Returns (account_id or None, message)."""
    username = (username or "").strip()
    password = password or ""
    generic = "Incorrect username or password."
    if len(password) > MAX_PASSWORD_LEN:
        return None, generic
    now = time.time()
    with _connect(role) as conn:
        row = conn.execute(
            "SELECT id, salt, pw_hash, failed_attempts, locked_until, disabled FROM accounts WHERE username = ?",
            (username,),
        ).fetchone()
        if row is None:
            _hash_password(password, _DUMMY_SALT)
            return None, generic
        if row["disabled"]:
            return None, generic
        if row["locked_until"] > now:
            minutes = int((row["locked_until"] - now) // 60) + 1
            return None, f"Too many failed attempts. Try again in about {minutes} minute(s)."
        if hmac.compare_digest(_hash_password(password, row["salt"]), row["pw_hash"]):
            conn.execute("UPDATE accounts SET failed_attempts = 0, locked_until = 0 WHERE id = ?", (row["id"],))
            return row["id"], "OK"
        attempts = row["failed_attempts"] + 1
        if attempts >= MAX_FAILED_ATTEMPTS:
            conn.execute(
                "UPDATE accounts SET failed_attempts = 0, locked_until = ? WHERE id = ?",
                (now + LOCKOUT_SECONDS, row["id"]),
            )
            return None, f"Too many failed attempts. This account is locked for {LOCKOUT_SECONDS // 60} minutes."
        conn.execute("UPDATE accounts SET failed_attempts = ? WHERE id = ?", (attempts, row["id"]))
        return None, generic


def change_password(role: str, account_id: int, old_password: str, new_password: str) -> bool:
    _validate_password(new_password)
    with _connect(role) as conn:
        row = conn.execute(
            "SELECT salt, pw_hash FROM accounts WHERE id = ?",
            (account_id,),
        ).fetchone()
        if row is None:
            return False
        if not hmac.compare_digest(_hash_password(old_password or "", row["salt"]), row["pw_hash"]):
            return False
        if (old_password or "") == new_password:
            raise ValueError("New password must be different from the current one.")
        if hmac.compare_digest(_hash_password(new_password, row["salt"]), row["pw_hash"]):
            raise ValueError("New password must not match the current password.")
        new_salt = secrets.token_hex(16)
        new_hash = _hash_password(new_password, new_salt)
        conn.execute(
            "UPDATE accounts SET salt = ?, pw_hash = ?, failed_attempts = 0, locked_until = 0 WHERE id = ?",
            (new_salt, new_hash, account_id),
        )
        log_event(str(account_id), role, "password_changed", "password_changed")
        return True


def set_account_disabled(role: str, username: str, disabled: bool) -> bool:
    with _connect(role) as conn:
        cur = conn.execute(
            "UPDATE accounts SET disabled = ? WHERE username = ?",
            (1 if disabled else 0, username),
        )
        return cur.rowcount > 0


def unlock_account(role: str, username: str) -> bool:
    with _connect(role) as conn:
        cur = conn.execute(
            "UPDATE accounts SET failed_attempts = 0, locked_until = 0, disabled = 0 WHERE username = ?",
            (username,),
        )
        return cur.rowcount > 0


def backup_databases(dest_dir: str | os.PathLike[str]) -> list[Path]:
    destination = Path(dest_dir)
    destination.mkdir(parents=True, exist_ok=True)
    files: list[Path] = []
    timestamp = time.strftime("%Y%m%d-%H%M%S")
    for role in ROLES:
        src = _db_path(role)
        if not src.exists():
            continue
        out = destination / f"{role}_{timestamp}.db"
        index = 1
        while out.exists():
            out = destination / f"{role}_{timestamp}_{index}.db"
            index += 1
        with sqlite3.connect(src) as src_conn, sqlite3.connect(out) as dst_conn:
            src_conn.backup(dst_conn)
        files.append(out)
    return files


def count_events(actor: str, action: str, minutes: int) -> int:
    with _connect("admin") as conn:
        row = conn.execute(
            "SELECT COUNT(*) AS c FROM audit_log WHERE actor = ? AND action = ? AND ts >= datetime('now', ?)",
            (actor, action, f'-{minutes} minutes'),
        ).fetchone()
    return int(row["c"]) if row else 0


def count_datasets(role: str, owner_id: int) -> int:
    with _connect(role) as conn:
        return conn.execute("SELECT COUNT(*) FROM datasets WHERE owner_id = ?", (owner_id,)).fetchone()[0]


def save_dataset(role: str, owner_id: int, name: str, df: pd.DataFrame) -> int:
    if count_datasets(role, owner_id) >= MAX_DATASETS_PER_ACCOUNT:
        raise ValueError(f"You can keep up to {MAX_DATASETS_PER_ACCOUNT} datasets. Delete one to upload another.")
    name = (name or "").strip()[:80] or "Untitled dataset"
    columns = [df[c].tolist() for c in _CUSTOMER_COLS]
    with _connect(role) as conn:
        dataset_id = conn.execute(
            "INSERT INTO datasets (owner_id, name, n_rows) VALUES (?, ?, ?)", (owner_id, name, len(df))
        ).lastrowid
        conn.executemany(_INSERT_CUSTOMER_SQL, [(dataset_id, *values) for values in zip(*columns)])
    return dataset_id


def list_datasets(role: str, owner_id: int) -> list[dict]:
    with _connect(role) as conn:
        rows = conn.execute(
            "SELECT id, name, n_rows, uploaded_at FROM datasets WHERE owner_id = ? ORDER BY id DESC",
            (owner_id,),
        ).fetchall()
    return [dict(r) for r in rows]


def load_dataset(role: str, owner_id: int, dataset_id: int):
    """Returns the dataset as a DataFrame, or None if it isn't owned by this account."""
    with _connect(role) as conn:
        owned = conn.execute(
            "SELECT 1 FROM datasets WHERE id = ? AND owner_id = ?", (dataset_id, owner_id)
        ).fetchone()
        if owned is None:
            return None
        return pd.read_sql_query(_SELECT_CUSTOMER_SQL, conn, params=(dataset_id,))


def delete_dataset(role: str, owner_id: int, dataset_id: int) -> bool:
    with _connect(role) as conn:
        cur = conn.execute("DELETE FROM datasets WHERE id = ? AND owner_id = ?", (dataset_id, owner_id))
        return cur.rowcount > 0


def log_event(actor: str, role: str, action: str, detail: str = "") -> None:
    """Append to the admin-only audit log."""
    try:
        with _connect("admin") as conn:
            conn.execute(
                "INSERT INTO audit_log (actor, role, action, detail) VALUES (?, ?, ?, ?)",
                ((actor or "")[:32], role, action, (detail or "")[:200]),
            )
    except sqlite3.Error:
        pass


def admin_overview():
    with _connect("user") as conn:
        users = conn.execute(
            """SELECT a.username, a.created_at, COUNT(d.id) AS datasets,
                      COALESCE(SUM(d.n_rows), 0) AS customers
               FROM accounts a LEFT JOIN datasets d ON d.owner_id = a.id
               GROUP BY a.id ORDER BY a.id"""
        ).fetchall()
    with _connect("admin") as conn:
        events = conn.execute(
            "SELECT ts, actor, role, action, detail FROM audit_log ORDER BY id DESC LIMIT 50"
        ).fetchall()
    return [dict(r) for r in users], [dict(r) for r in events]
