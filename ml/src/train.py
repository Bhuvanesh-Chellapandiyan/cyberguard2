"""
Machine Learning Model Training Pipeline for Phishing Website Detection.
Implements Random Forest Classifier with real URL feature extraction and evaluation.
"""

import os
import json
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report
)

from feature_extractor import FEATURE_NAMES, extract_features, features_to_vector


def train_model(
    data_path: str = "ml/data/urls_dataset.csv",
    model_output_dir: str = "ml/models",
    backend_model_dir: str = "backend/app/ml"
):
    print("=" * 60)
    print("PHISHING DETECTOR - ML TRAINING PIPELINE")
    print("=" * 60)

    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Dataset not found at {data_path}")

    # 1. Load Dataset
    print(f"[1/6] Loading dataset from: {data_path}")
    df = pd.read_csv(data_path)
    print(f"      Total records loaded: {len(df)}")

    # 2. Data Cleaning & Validation
    print("[2/6] Cleaning data and dropping invalid entries...")
    df = df.dropna(subset=["url", "label"])
    df["url"] = df["url"].astype(str).str.strip()
    df = df[df["url"] != ""]
    df = df.drop_duplicates(subset=["url"])
    df["label"] = df["label"].astype(int)

    total_valid = len(df)
    legit_count = (df["label"] == 0).sum()
    phish_count = (df["label"] == 1).sum()
    print(f"      Cleaned dataset size: {total_valid}")
    print(f"      - Legitimate (0): {legit_count} ({legit_count/total_valid*100:.1f}%)")
    print(f"      - Phishing   (1): {phish_count} ({phish_count/total_valid*100:.1f}%)")

    # 3. Extract Features
    print("[3/6] Extracting 22 engineered features for each URL...")
    feature_rows = []
    for idx, row in df.iterrows():
        feat_dict = extract_features(row["url"])
        feat_vec = features_to_vector(feat_dict)
        feature_rows.append(feat_vec)

    X = np.array(feature_rows)
    y = df["label"].to_numpy()

    # 4. Train / Test Split (80% train, 20% test with stratified sampling)
    print("[4/6] Splitting dataset into 80% Train and 20% Test sets...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"      Training samples: {len(X_train)} | Test samples: {len(X_test)}")

    # 5. Train Random Forest Classifier
    print("[5/6] Training Random Forest Classifier...")
    clf = RandomForestClassifier(
        n_estimators=100,
        max_depth=12,
        min_samples_split=3,
        min_samples_leaf=1,
        random_state=42,
        n_jobs=-1
    )
    clf.fit(X_train, y_train)

    # 6. Model Evaluation on Unseen Test Data
    print("[6/6] Evaluating model on unseen test set...")
    y_pred = clf.predict(X_test)

    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred, zero_division=0))
    rec = float(recall_score(y_test, y_pred, zero_division=0))
    f1 = float(f1_score(y_test, y_pred, zero_division=0))
    cm = confusion_matrix(y_test, y_pred).tolist()

    # Feature Importance
    importances = dict(zip(FEATURE_NAMES, [float(v) for v in clf.feature_importances_]))
    sorted_importances = sorted(importances.items(), key=lambda x: x[1], reverse=True)

    print("\n" + "=" * 60)
    print("MODEL EVALUATION RESULTS (TEST SET):")
    print("=" * 60)
    print(f"Accuracy : {acc * 100:.2f}%")
    print(f"Precision: {prec * 100:.2f}%")
    print(f"Recall   : {rec * 100:.2f}%")
    print(f"F1 Score : {f1 * 100:.2f}%")
    print("\nConfusion Matrix:")
    print(f"  [TN={cm[0][0]}, FP={cm[0][1]}]")
    print(f"  [FN={cm[1][0]}, TP={cm[1][1]}]")
    print("\nTop 5 Most Important Features:")
    for feat_name, imp in sorted_importances[:5]:
        print(f"  - {feat_name}: {imp * 100:.2f}%")
    print("=" * 60)

    # Prepare Metadata & Model Bundle
    metadata = {
        "model_type": "RandomForestClassifier",
        "n_estimators": 100,
        "max_depth": 12,
        "random_state": 42,
        "feature_names": FEATURE_NAMES,
        "metrics": {
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1_score": round(f1, 4),
            "confusion_matrix": cm,
        },
        "feature_importances": importances,
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "class_distribution": {
            "legitimate": int(legit_count),
            "phishing": int(phish_count)
        }
    }

    # Save to ml/models
    os.makedirs(model_output_dir, exist_ok=True)
    model_save_path = os.path.join(model_output_dir, "phishing_model.joblib")
    meta_save_path = os.path.join(model_output_dir, "model_metadata.json")

    joblib.dump(clf, model_save_path)
    with open(meta_save_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    print(f"\n[Saved] Trained model saved to: {model_save_path}")
    print(f"[Saved] Metadata saved to: {meta_save_path}")

    # Also save directly into backend/app/ml/ for backend serving
    os.makedirs(backend_model_dir, exist_ok=True)
    backend_model_path = os.path.join(backend_model_dir, "phishing_model.joblib")
    backend_meta_path = os.path.join(backend_model_dir, "model_metadata.json")
    joblib.dump(clf, backend_model_path)
    with open(backend_meta_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    print(f"[Synced] Copied model directly to backend: {backend_model_path}")

    # Generate Markdown Evaluation Report
    report_path = os.path.join(model_output_dir, "evaluation_report.md")
    with open(report_path, "w", encoding="utf-8") as f:
        f.write("# Phishing Detection Model - Evaluation Report\n\n")
        f.write(f"- **Algorithm:** Random Forest Classifier (100 estimators, max depth 12)\n")
        f.write(f"- **Dataset Size:** {total_valid} URLs ({legit_count} Legitimate, {phish_count} Phishing)\n")
        f.write(f"- **Split:** 80% Train ({len(X_train)}), 20% Test ({len(X_test)})\n\n")
        f.write("## Test Performance Metrics\n\n")
        f.write(f"| Metric | Value |\n|---|---|\n")
        f.write(f"| Accuracy | {acc * 100:.2f}% |\n")
        f.write(f"| Precision | {prec * 100:.2f}% |\n")
        f.write(f"| Recall | {rec * 100:.2f}% |\n")
        f.write(f"| F1 Score | {f1 * 100:.2f}% |\n\n")
        f.write("## Confusion Matrix\n\n")
        f.write(f"- True Negatives (Legitimate predicted Legitimate): **{cm[0][0]}**\n")
        f.write(f"- False Positives (Legitimate predicted Phishing): **{cm[0][1]}**\n")
        f.write(f"- False Negatives (Phishing predicted Legitimate): **{cm[1][0]}**\n")
        f.write(f"- True Positives (Phishing predicted Phishing): **{cm[1][1]}**\n\n")
        f.write("## Top 10 Feature Importances\n\n")
        f.write("| Feature | Importance |\n|---|---|\n")
        for k, v in sorted_importances[:10]:
            f.write(f"| `{k}` | {v * 100:.2f}% |\n")
    print(f"[Saved] Evaluation report saved to: {report_path}")

    return metadata


if __name__ == "__main__":
    train_model()
