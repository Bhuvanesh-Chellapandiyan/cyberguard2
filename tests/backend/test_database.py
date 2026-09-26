"""
Database layer tests verifying MongoDB schema compliance and user data isolation.
"""

import sys
import os
import pytest
from bson import ObjectId

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../backend")))

from app.database import get_database, format_doc
from app.services.auth_service import register_user, get_user_by_email, get_user_by_id
from app.services.detection_service import analyze_url, get_user_scans, get_scan_by_id, delete_scan_by_id


def test_user_creation_and_retrieval():
    db = get_database()
    email = "dbuser@example.com"
    # Ensure clean state
    db.users.delete_many({"email": email})

    user = register_user(db, "DB User", email, "SecretPass123!")
    assert user["id"] is not None
    assert user["email"] == email

    fetched = get_user_by_email(db, email)
    assert fetched is not None
    assert fetched["name"] == "DB User"

    by_id = get_user_by_id(db, user["id"])
    assert by_id is not None
    assert by_id["email"] == email


def test_scan_persistence_and_user_isolation():
    db = get_database()
    # Create two users
    u1_email = "user1.isolation@example.com"
    u2_email = "user2.isolation@example.com"
    db.users.delete_many({"email": {"$in": [u1_email, u2_email]}})

    u1 = register_user(db, "User One", u1_email, "Pass123!")
    u2 = register_user(db, "User Two", u2_email, "Pass123!")

    # User 1 scans a URL
    scan1 = analyze_url("https://www.netflix.com", user_id=u1["id"], db=db)
    assert scan1["id"] is not None

    # User 2 scans a URL
    scan2 = analyze_url("http://192.168.1.1/banking/login.php", user_id=u2["id"], db=db)
    assert scan2["id"] is not None

    # User 1 history should only contain user 1's scan
    u1_history = get_user_scans(db, u1["id"])
    u1_urls = [s["url"] for s in u1_history["scans"]]
    assert "https://www.netflix.com" in u1_urls
    assert "http://192.168.1.1/banking/login.php" not in u1_urls

    # User 2 should NOT be able to access User 1's scan
    isolated_scan = get_scan_by_id(db, scan1["id"], user_id=u2["id"])
    assert isolated_scan is None

    # User 2 cannot delete User 1's scan
    deleted = delete_scan_by_id(db, scan1["id"], user_id=u2["id"])
    assert deleted is False
