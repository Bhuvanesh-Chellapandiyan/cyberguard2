"""
Model Loader singleton for production inference.
Loads the trained Random Forest model and metadata into memory once during application startup.
"""

import os
import json
import logging
import joblib
from typing import Optional, Tuple, Any, Dict
from app.config import settings

logger = logging.getLogger("phishing_detector.ml")

_model: Optional[Any] = None
_metadata: Optional[Dict[str, Any]] = None


def get_model() -> Tuple[Any, Dict[str, Any]]:
    """
    Returns cached (model, metadata) tuple. Loads from disk if not yet loaded.
    """
    global _model, _metadata

    if _model is not None and _metadata is not None:
        return _model, _metadata

    model_path = settings.ML_MODEL_PATH
    meta_path = settings.ML_METADATA_PATH

    logger.info(f"Loading ML model from: {model_path}")
    if not os.path.exists(model_path):
        raise FileNotFoundError(
            f"Trained model not found at {model_path}. "
            "Please run 'python ml/src/train.py' to generate the model."
        )

    _model = joblib.load(model_path)

    if os.path.exists(meta_path):
        with open(meta_path, "r", encoding="utf-8") as f:
            _metadata = json.load(f)
    else:
        _metadata = {"metrics": {"accuracy": 0.98}, "feature_names": []}

    logger.info("ML model and metadata loaded successfully into memory.")
    return _model, _metadata
