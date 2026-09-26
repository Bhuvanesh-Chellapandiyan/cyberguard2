"""
Standalone CLI prediction utility for testing single URLs.
"""

import sys
import os
import joblib
import numpy as np

# Add current directory to path
sys.path.append(os.path.dirname(__file__))

from feature_extractor import extract_features, features_to_vector


def predict_url(url: str, model_path: str = "ml/models/phishing_model.joblib"):
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model not found at {model_path}. Train the model first.")

    model = joblib.load(model_path)
    features = extract_features(url)
    vector = np.array([features_to_vector(features)])

    prediction = model.predict(vector)[0]
    probabilities = model.predict_proba(vector)[0]

    label = "PHISHING" if prediction == 1 else "LEGITIMATE"
    confidence = probabilities[prediction] * 100.0

    if label == "PHISHING":
        risk_level = "HIGH" if confidence > 80 else "MEDIUM"
    else:
        risk_level = "LOW" if confidence > 80 else "MEDIUM"

    return {
        "url": url,
        "prediction": label,
        "confidence": round(confidence, 2),
        "risk_level": risk_level,
        "features": features
    }


if __name__ == "__main__":
    test_url = sys.argv[1] if len(sys.argv) > 1 else "http://192.168.1.1/banking/login.php"
    res = predict_url(test_url)
    print(f"URL: {res['url']}")
    print(f"Prediction: {res['prediction']}")
    print(f"Confidence: {res['confidence']}%")
    print(f"Risk Level: {res['risk_level']}")
