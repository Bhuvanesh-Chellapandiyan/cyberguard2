"""
Model Evaluation CLI Script.
Loads the trained Random Forest model and produces detailed classification reports.
"""

import os
import json
import joblib
import pandas as pd
import numpy as np
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score

from feature_extractor import FEATURE_NAMES, extract_features, features_to_vector


def evaluate_model(
    model_path: str = "ml/models/phishing_model.joblib",
    data_path: str = "ml/data/urls_dataset.csv"
):
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found at {model_path}. Run train.py first.")
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Dataset not found at {data_path}.")

    print("Loading model and data for evaluation...")
    model = joblib.load(model_path)
    df = pd.read_csv(data_path).dropna(subset=["url", "label"])

    X = np.array([features_to_vector(extract_features(u)) for u in df["url"]])
    y = df["label"].astype(int).to_numpy()

    y_pred = model.predict(X)
    acc = accuracy_score(y, y_pred)
    cm = confusion_matrix(y, y_pred)
    report = classification_report(y, y_pred, target_names=["Legitimate", "Phishing"])

    print("=" * 60)
    print(f"Overall Accuracy: {acc * 100:.2f}%")
    print("=" * 60)
    print("Classification Report:")
    print(report)
    print("Confusion Matrix:")
    print(cm)
    print("=" * 60)


if __name__ == "__main__":
    evaluate_model()
