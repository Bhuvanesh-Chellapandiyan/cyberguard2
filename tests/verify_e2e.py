"""
End-to-End System Verification Script.
Executes live API workflows using FastAPI TestClient to validate the complete application stack.
"""

import sys
import os

# Add backend to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../backend")))

from fastapi.testclient import TestClient
from app.main import app
from app.database import get_database

client = TestClient(app)


def run_e2e_verification():
    print("=" * 70)
    print("CYBERGUARD E2E SYSTEM INTEGRATION & VERIFICATION RUN")
    print("=" * 70)

    # 1. Health Endpoint
    print("\n[1/12] Testing Health Endpoint (/api/health)...")
    res = client.get("/api/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    health_data = res.json()
    print(f"       Status: {health_data['status']} | DB: {health_data['database']} | Model: {health_data['model']}")
    assert health_data["status"] == "ok"

    # 2. User Registration
    test_email = "analyst.e2e@cyberguard.com"
    test_pass = "SecurityTest@2026!"
    print(f"\n[2/12] Testing User Registration ({test_email})...")
    # Clean previous if exists
    db = get_database()
    db.users.delete_many({"email": test_email})

    reg_res = client.post("/api/auth/register", json={
        "name": "E2E Lead Analyst",
        "email": test_email,
        "password": test_pass,
        "confirm_password": test_pass
    })
    assert reg_res.status_code == 201, f"Registration failed: {reg_res.text}"
    token = reg_res.json()["access_token"]
    user_id = reg_res.json()["user"]["id"]
    print(f"       Success! User ID: {user_id} | Token: {token[:20]}...")

    # 3. User Login
    print("\n[3/12] Testing User Login with valid credentials...")
    login_res = client.post("/api/auth/login", json={
        "email": test_email,
        "password": test_pass
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("       Login successful, JWT token re-issued.")

    # 4. Identity Check (/api/auth/me)
    print("\n[4/12] Testing Authenticated Profile (/api/auth/me)...")
    me_res = client.get("/api/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["email"] == test_email
    print(f"       Verified user identity: {me_res.json()['name']} ({me_res.json()['email']})")

    # 5. Legitimate URL Detection
    print("\n[5/12] Testing Legitimate URL Detection (https://github.com/fastapi/fastapi)...")
    legit_res = client.post("/api/detect", json={"url": "https://github.com/fastapi/fastapi"}, headers=headers)
    assert legit_res.status_code == 200
    legit_data = legit_res.json()
    print(f"       Prediction: {legit_data['prediction']} | Confidence: {legit_data['confidence']}% | Risk: {legit_data['risk_level']}")
    assert legit_data["prediction"] == "LEGITIMATE"
    assert legit_data["risk_level"] == "LOW"
    assert len(legit_data["reasons"]) > 0

    # 6. Phishing URL Detection
    print("\n[6/12] Testing Phishing URL Detection (http://192.168.1.1/banking/login.php)...")
    phish_res = client.post("/api/detect", json={"url": "http://192.168.1.1/banking/login.php"}, headers=headers)
    assert phish_res.status_code == 200
    phish_data = phish_res.json()
    print(f"       Prediction: {phish_data['prediction']} | Confidence: {phish_data['confidence']}% | Risk: {phish_data['risk_level']}")
    assert phish_data["prediction"] == "PHISHING"
    assert phish_data["risk_level"] in ["HIGH", "MEDIUM"]
    print(f"       XAI Reasons Grounded: {phish_data['reasons']}")

    # 7. Additional Targeted Phishing Scan
    print("\n[7/12] Testing Spoofed Brand Phishing (http://paypa1-security-verify.com/login.html)...")
    spoof_res = client.post("/api/detect", json={"url": "http://paypa1-security-verify.com/login.html"}, headers=headers)
    assert spoof_res.status_code == 200
    spoof_data = spoof_res.json()
    print(f"       Prediction: {spoof_data['prediction']} | Confidence: {spoof_data['confidence']}%")
    assert spoof_data["prediction"] == "PHISHING"

    # 8. Dashboard Statistics
    print("\n[8/12] Testing Dashboard Analytics Aggregation (/api/dashboard/stats)...")
    dash_res = client.get("/api/dashboard/stats", headers=headers)
    assert dash_res.status_code == 200
    dash_data = dash_res.json()
    print(f"       Total Scans: {dash_data['total_scans']} | Phishing: {dash_data['phishing_count']} | Legitimate: {dash_data['legitimate_count']}")
    print(f"       Average Confidence: {dash_data['average_confidence']}%")
    assert dash_data["total_scans"] >= 3
    assert dash_data["phishing_count"] >= 2
    assert dash_data["legitimate_count"] >= 1

    # 9. Detection History Query with Filtering
    print("\n[9/12] Testing Detection History Filtering (/api/detections?prediction=PHISHING)...")
    hist_res = client.get("/api/detections?prediction=PHISHING", headers=headers)
    assert hist_res.status_code == 200
    hist_data = hist_res.json()
    print(f"       Retrieved {len(hist_data['scans'])} filtered scans out of {hist_data['total']} matching.")
    assert all(s["prediction"] == "PHISHING" for s in hist_data["scans"])

    # 10. Specific Scan Detail
    target_scan_id = hist_data["scans"][0]["id"]
    print(f"\n[10/12] Testing Single Scan Detail (/api/detections/{target_scan_id})...")
    detail_res = client.get(f"/api/detections/{target_scan_id}", headers=headers)
    assert detail_res.status_code == 200
    assert detail_res.json()["id"] == target_scan_id
    assert "features" in detail_res.json()
    print(f"       Inspected feature vector containing {len(detail_res.json()['features'])} attributes.")

    # 11. Profile Update
    print("\n[11/12] Testing Profile Name Update (/api/profile)...")
    prof_res = client.put("/api/profile", json={"name": "Senior Security Analyst (Updated)"}, headers=headers)
    assert prof_res.status_code == 200
    assert prof_res.json()["name"] == "Senior Security Analyst (Updated)"
    print(f"       Profile updated successfully: {prof_res.json()['name']}")

    # 12. Scan Deletion
    print(f"\n[12/12] Testing Scan Deletion (/api/detections/{target_scan_id})...")
    del_res = client.delete(f"/api/detections/{target_scan_id}", headers=headers)
    assert del_res.status_code == 200
    assert del_res.json()["success"] is True
    # Confirm deletion
    check_del = client.get(f"/api/detections/{target_scan_id}", headers=headers)
    assert check_del.status_code == 404
    print("       Scan record deleted and confirmed removed from database.")

    print("\n" + "=" * 70)
    print("ALL 12 END-TO-END SYSTEM INTEGRATION WORKFLOWS PASSED!")
    print("=" * 70)


if __name__ == "__main__":
    run_e2e_verification()
