"""
Integration tests for Dashboard aggregation and telemetry metrics.
"""

import sys
import os
import pytest
from fastapi.testclient import TestClient

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../backend")))

from app.main import app

client = TestClient(app)


def test_dashboard_metrics_calculation():
    # Register a new user
    email = "dash.tester@example.com"
    reg = client.post("/api/auth/register", json={
        "name": "Dashboard Tester",
        "email": email,
        "password": "Password123!",
        "confirm_password": "Password123!"
    })
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Empty stats initially
    stats0 = client.get("/api/dashboard/stats", headers=headers).json()
    assert stats0["total_scans"] == 0
    assert stats0["phishing_count"] == 0
    assert stats0["legitimate_count"] == 0
    assert stats0["average_confidence"] == 0.0

    # Scan 1 Legitimate URL
    client.post("/api/detect", json={"url": "https://www.google.com"}, headers=headers)

    # Scan 1 Phishing URL
    client.post("/api/detect", json={"url": "http://192.168.1.1/banking/login.php"}, headers=headers)

    # Re-fetch stats
    stats1 = client.get("/api/dashboard/stats", headers=headers).json()
    assert stats1["total_scans"] == 2
    assert stats1["phishing_count"] == 1
    assert stats1["legitimate_count"] == 1
    assert stats1["average_confidence"] > 50.0
    assert "risk_distribution" in stats1
    assert "timeline" in stats1
    assert len(stats1["recent_scans"]) == 2
