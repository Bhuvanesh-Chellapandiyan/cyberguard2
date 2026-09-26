"""
Unit tests for URL feature extraction and vectorization.
"""

import pytest
import sys
import os

# Add backend and ml to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../backend")))
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../ml/src")))

from app.ml.feature_extractor import extract_features, features_to_vector, FEATURE_NAMES


def test_feature_extractor_returns_all_22_features():
    features = extract_features("https://www.google.com/search?q=test")
    assert isinstance(features, dict)
    assert len(features) == len(FEATURE_NAMES)
    for name in FEATURE_NAMES:
        assert name in features, f"Missing feature {name}"


def test_feature_vector_order_and_types():
    features = extract_features("https://github.com/fastapi/fastapi")
    vector = features_to_vector(features)
    assert len(vector) == len(FEATURE_NAMES)
    assert all(isinstance(val, (int, float)) for val in vector)


def test_ip_address_detection():
    ip_url = "http://192.168.1.1/banking/login.php"
    features = extract_features(ip_url)
    assert features["has_ip"] == 1
    assert features["has_https"] == 0


def test_https_detection():
    https_url = "https://www.cloudflare.com"
    features = extract_features(https_url)
    assert features["has_https"] == 1
    assert features["has_ip"] == 0


def test_suspicious_keywords_detection():
    phish_url = "http://update-paypal-verify-account.info/login"
    features = extract_features(phish_url)
    assert features["has_suspicious_keywords"] == 1


def test_url_shortener_detection():
    short_url = "http://bit.ly/urgent-banking-alert"
    features = extract_features(short_url)
    assert features["is_shortened"] == 1
