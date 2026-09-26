"""
Integration tests for Authentication API endpoints.
"""

import sys
import os
import pytest
from fastapi.testclient import TestClient

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../backend")))

from app.main import app
from app.database import get_database

client = TestClient(app)


@pytest.fixture(autouse=True)
def clean_db():
    db = get_database()
    # Reset test users except admin
    db.users.delete_many({"email": {"$ne": "admin@cyberguard.local"}})
    yield


def test_register_valid_user():
    payload = {
        "name": "Jane Tester",
        "email": "jane.tester@example.com",
        "password": "SecurePassword123!",
        "confirm_password": "SecurePassword123!"
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "jane.tester@example.com"
    assert data["user"]["name"] == "Jane Tester"
    assert "password_hash" not in data["user"]


def test_register_duplicate_email():
    payload = {
        "name": "Jane Tester",
        "email": "duplicate@example.com",
        "password": "SecurePassword123!",
        "confirm_password": "SecurePassword123!"
    }
    res1 = client.post("/api/auth/register", json=payload)
    assert res1.status_code == 201

    res2 = client.post("/api/auth/register", json=payload)
    assert res2.status_code == 400
    assert "already exists" in res2.json()["detail"]


def test_login_valid_credentials():
    # Register first
    client.post("/api/auth/register", json={
        "name": "Login User",
        "email": "login.user@example.com",
        "password": "Password123!",
        "confirm_password": "Password123!"
    })

    # Login
    response = client.post("/api/auth/login", json={
        "email": "login.user@example.com",
        "password": "Password123!"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "login.user@example.com"


def test_login_invalid_credentials():
    response = client.post("/api/auth/login", json={
        "email": "nonexistent@example.com",
        "password": "WrongPassword!"
    })
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]


def test_protected_endpoint_without_token():
    response = client.get("/api/auth/me")
    assert response.status_code == 401
    assert "missing" in response.json()["detail"].lower()


def test_protected_endpoint_with_invalid_token():
    headers = {"Authorization": "Bearer invalid.fake.token.string"}
    response = client.get("/api/auth/me", headers=headers)
    assert response.status_code == 401
    assert "invalid or expired" in response.json()["detail"].lower()
