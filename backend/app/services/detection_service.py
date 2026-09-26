"""
Detection service orchestrating ML feature extraction, inference, explanation generation,
and MongoDB persistence.
"""

from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional
import numpy as np
from bson import ObjectId
from pymongo.database import Database
from pymongo import DESCENDING

from app.ml.feature_extractor import extract_features, features_to_vector
from app.ml.model_loader import get_model
from app.services.explanation_service import generate_explanation
from app.database import format_doc


def analyze_url(url: str, user_id: Optional[str] = None, db: Optional[Database] = None) -> Dict[str, Any]:
    """
    Full pipeline: extract features -> model inference -> XAI explanation -> MongoDB save.
    """
    # 1. Feature extraction
    features = extract_features(url)
    vector = np.array([features_to_vector(features)])

    # 2. ML Inference
    model, _ = get_model()
    raw_pred = model.predict(vector)[0]
    probabilities = model.predict_proba(vector)[0]

    prediction = "PHISHING" if raw_pred == 1 else "LEGITIMATE"
    confidence = round(float(probabilities[raw_pred]) * 100.0, 2)

    # 3. Determine Risk Level
    if prediction == "PHISHING":
        risk_level = "HIGH" if confidence >= 75.0 else "MEDIUM"
    else:
        risk_level = "LOW" if confidence >= 75.0 else "MEDIUM"

    # 4. Generate Explainable Reasons
    reasons = generate_explanation(features, prediction, confidence)

    now = datetime.now(timezone.utc)

    # 5. Persist to MongoDB if database is provided
    scan_doc = {
        "user_id": ObjectId(user_id) if user_id else None,
        "url": url,
        "prediction": prediction,
        "confidence": confidence,
        "risk_level": risk_level,
        "features": features,
        "reasons": reasons,
        "created_at": now
    }

    scan_id = None
    if db is not None:
        try:
            res = db.scans.insert_one(scan_doc)
            scan_id = str(res.inserted_id)
        except Exception as e:
            # Non-blocking logging of persistence failure
            pass

    return {
        "id": scan_id,
        "url": url,
        "prediction": prediction,
        "confidence": confidence,
        "risk_level": risk_level,
        "features": features,
        "reasons": reasons,
        "created_at": now
    }


def get_user_scans(
    db: Database,
    user_id: str,
    search: Optional[str] = None,
    prediction: Optional[str] = None,
    risk_level: Optional[str] = None,
    page: int = 1,
    limit: int = 20
) -> Dict[str, Any]:
    """
    Fetches filtered, paginated scan history for a user.
    """
    query: Dict[str, Any] = {"user_id": ObjectId(user_id)}

    if search:
        query["url"] = {"$regex": search.strip(), "$options": "i"}

    if prediction and prediction.upper() in ["PHISHING", "LEGITIMATE"]:
        query["prediction"] = prediction.upper()

    if risk_level and risk_level.upper() in ["LOW", "MEDIUM", "HIGH"]:
        query["risk_level"] = risk_level.upper()

    total = db.scans.count_documents(query)
    skip = (page - 1) * limit

    cursor = db.scans.find(query).sort("created_at", DESCENDING).skip(skip).limit(limit)
    scans = [format_doc(doc) for doc in cursor]

    return {
        "scans": scans,
        "total": total,
        "page": page,
        "limit": limit
    }


def get_scan_by_id(db: Database, scan_id: str, user_id: str) -> Optional[dict]:
    try:
        doc = db.scans.find_one({"_id": ObjectId(scan_id), "user_id": ObjectId(user_id)})
        return format_doc(doc)
    except Exception:
        return None


def delete_scan_by_id(db: Database, scan_id: str, user_id: str) -> bool:
    try:
        res = db.scans.delete_one({"_id": ObjectId(scan_id), "user_id": ObjectId(user_id)})
        return res.deleted_count > 0
    except Exception:
        return False


def get_dashboard_metrics(db: Database, user_id: str) -> Dict[str, Any]:
    """
    Computes real aggregation stats for the user dashboard.
    """
    u_id = ObjectId(user_id)
    all_scans = list(db.scans.find({"user_id": u_id}).sort("created_at", DESCENDING))

    total = len(all_scans)
    phishing = sum(1 for s in all_scans if s.get("prediction") == "PHISHING")
    legitimate = sum(1 for s in all_scans if s.get("prediction") == "LEGITIMATE")

    avg_conf = 0.0
    if total > 0:
        avg_conf = round(sum(s.get("confidence", 0.0) for s in all_scans) / total, 2)

    risk_dist = {
        "LOW": sum(1 for s in all_scans if s.get("risk_level") == "LOW"),
        "MEDIUM": sum(1 for s in all_scans if s.get("risk_level") == "MEDIUM"),
        "HIGH": sum(1 for s in all_scans if s.get("risk_level") == "HIGH"),
    }

    # Timeline of scans by day for the last 7 days
    now = datetime.now(timezone.utc)
    timeline_dict = {}
    for i in range(6, -1, -1):
        day_date = (now - timedelta(days=i)).strftime("%Y-%m-%d")
        timeline_dict[day_date] = {"date": day_date, "phishing": 0, "legitimate": 0, "total": 0}

    for s in all_scans:
        created = s.get("created_at")
        if created:
            day_str = created.strftime("%Y-%m-%d")
            if day_str in timeline_dict:
                timeline_dict[day_str]["total"] += 1
                if s.get("prediction") == "PHISHING":
                    timeline_dict[day_str]["phishing"] += 1
                else:
                    timeline_dict[day_str]["legitimate"] += 1

    timeline = list(timeline_dict.values())
    recent = [format_doc(s) for s in all_scans[:5]]

    return {
        "total_scans": total,
        "phishing_count": phishing,
        "legitimate_count": legitimate,
        "average_confidence": avg_conf,
        "risk_distribution": risk_dist,
        "timeline": timeline,
        "recent_scans": recent
    }
