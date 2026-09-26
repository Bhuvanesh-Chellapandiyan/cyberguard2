"""
Authentication and Cryptography Service.
Handles secure bcrypt password hashing, JWT generation & verification, and user management.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
import bcrypt
import jwt
from bson import ObjectId
from pymongo.database import Database
from pymongo.errors import DuplicateKeyError

from app.config import settings
from app.database import format_doc


def hash_password(password: str) -> str:
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8")
        )
    except Exception:
        return False


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except (jwt.PyJWTError, Exception):
        return None


def get_user_by_email(db: Database, email: str) -> Optional[dict]:
    doc = db.users.find_one({"email": email.strip().lower()})
    return doc


def get_user_by_id(db: Database, user_id: str) -> Optional[dict]:
    try:
        doc = db.users.find_one({"_id": ObjectId(user_id)})
        return doc
    except Exception:
        return None


def register_user(db: Database, name: str, email: str, password: str, role: str = "user") -> dict:
    normalized_email = email.strip().lower()

    # Check if already exists
    if get_user_by_email(db, normalized_email):
        raise ValueError("An account with this email address already exists.")

    hashed = hash_password(password)
    now = datetime.now(timezone.utc)

    user_doc = {
        "name": name.strip(),
        "email": normalized_email,
        "password_hash": hashed,
        "role": role,
        "created_at": now,
        "updated_at": now
    }

    try:
        result = db.users.insert_one(user_doc)
        user_doc["_id"] = result.inserted_id
        return format_doc(user_doc)
    except DuplicateKeyError:
        raise ValueError("An account with this email address already exists.")


def seed_admin_user(db: Database):
    """
    Creates or updates the default admin account with verified password hash.
    """
    admin_email = settings.ADMIN_EMAIL.strip().lower()
    hashed = hash_password(settings.ADMIN_PASSWORD)
    now = datetime.now(timezone.utc)

    existing = db.users.find_one({"email": admin_email})
    if not existing:
        db.users.insert_one({
            "name": "CyberGuard Security Admin",
            "email": admin_email,
            "password_hash": hashed,
            "role": "admin",
            "created_at": now,
            "updated_at": now
        })
    else:
        db.users.update_one(
            {"email": admin_email},
            {"$set": {
                "password_hash": hashed,
                "role": "admin",
                "updated_at": now
            }}
        )
