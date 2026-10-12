"""
Create an admin account for DMaut.

    python create_admin.py

Run it once before the first start (run it again to add more admins).
The password is typed hidden and stored only as a salted hash in data/admin.db.
"""
import getpass
import sys

import db


def main() -> None:
    db.init_db()
    username = input("Admin username: ").strip()
    password = getpass.getpass(f"Admin password (at least {db.MIN_PASSWORD_LEN} characters): ")
    if password != getpass.getpass("Confirm password: "):
        sys.exit("Passwords do not match. Nothing was created.")
    try:
        db.create_account("admin", username, password)
    except ValueError as err:
        sys.exit(f"Could not create the account: {err}")
    db.log_event(username, "admin", "admin_created")
    print(f"Admin '{username}' created. You can now run:  streamlit run app.py")


if __name__ == "__main__":
    main()
