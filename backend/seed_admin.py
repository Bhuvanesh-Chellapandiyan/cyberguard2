"""
Admin Seed Script for CyberGuard Database.
Ensures admin@cyberguard.org with password CyberGuard@2026! exists in MongoDB.
"""

import sys
import os
from datetime import datetime, timezone

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import get_database
from app.services.auth_service import hash_password
from app.config import settings

def seed():
    db = get_database()
    email = settings.ADMIN_EMAIL.strip().lower()
    password = settings.ADMIN_PASSWORD
    hashed = hash_password(password)
    now = datetime.now(timezone.utc)

    existing = db.users.find_one({"email": email})
    if existing:
        db.users.update_one(
            {"email": email},
            {"$set": {
                "password_hash": hashed,
                "role": "admin",
                "updated_at": now
            }}
        )
        print(f"Updated existing admin account: {email}")
    else:
        db.users.insert_one({
            "name": "CyberGuard Security Admin",
            "email": email,
            "password_hash": hashed,
            "role": "admin",
            "created_at": now,
            "updated_at": now
        })
        print(f"Created new admin account: {email}")

    # Verify
    user = db.users.find_one({"email": email})
    print("Verification result:", {"email": user["email"], "role": user.get("role")})

if __name__ == "__main__":
    seed()
