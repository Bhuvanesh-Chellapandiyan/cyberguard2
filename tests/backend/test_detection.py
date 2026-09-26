"""
Integration tests for URL Detection and ML Inference.
"""

import sys
import os
import pytest
from fastapi.testclient import TestClient

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../backend")))

from app.main import app

client = TestClient(app)


def test_detect_empty_url():
    response = client.post("/api/detect", json={"url": ""})
    assert response.status_code == 422


def test_detect_whitespace_url():
    response = client.post("/api/detect", json={"url": "   "})
    assert response.status_code == 422


def test_detect_invalid_url_format():
    response = client.post("/api/detect", json={"url": "not_a_valid_url_no_dots"})
    assert response.status_code == 422


def test_detect_legitimate_url():
    response = client.post("/api/detect", json={"url": "https://www.google.com/search?q=security"})
    assert response.status_code == 200
    data = response.json()
    assert data["prediction"] == "LEGITIMATE"
    assert data["confidence"] > 50.0
    assert data["risk_level"] in ["LOW", "MEDIUM"]
    assert "features" in data
    assert len(data["reasons"]) > 0
    assert any("https" in r.lower() for r in data["reasons"])


def test_detect_phishing_url():
    response = client.post("/api/detect", json={"url": "http://192.168.1.1/banking/login.php"})
    assert response.status_code == 200
    data = response.json()
    assert data["prediction"] == "PHISHING"
    assert data["risk_level"] in ["HIGH", "MEDIUM"]
    assert any("ip address" in r.lower() for r in data["reasons"])


def test_authenticated_detection_persists_scan():
    # Register & login
    reg_res = client.post("/api/auth/register", json={
        "name": "Scan Tester",
        "email": "scantester@example.com",
        "password": "Password123!",
        "confirm_password": "Password123!"
    })
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Perform scan
    scan_res = client.post(
        "/api/detect",
        json={"url": "https://en.wikipedia.org/wiki/Phishing"},
        headers=headers
    )
    assert scan_res.status_code == 200
    scan_id = scan_res.json()["id"]
    assert scan_id is not None

    # Verify scan is in history
    history_res = client.get("/api/detections", headers=headers)
    assert history_res.status_code == 200
    history_data = history_res.json()
    assert history_data["total"] >= 1
    urls = [s["url"] for s in history_data["scans"]]
    assert "https://en.wikipedia.org/wiki/Phishing" in urls
