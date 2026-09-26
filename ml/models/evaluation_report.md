# Phishing Detection Model - Evaluation Report

- **Algorithm:** Random Forest Classifier (100 estimators, max depth 12)
- **Dataset Size:** 447 URLs (251 Legitimate, 196 Phishing)
- **Split:** 80% Train (357), 20% Test (90)

## Test Performance Metrics

| Metric | Value |
|---|---|
| Accuracy | 100.00% |
| Precision | 100.00% |
| Recall | 100.00% |
| F1 Score | 100.00% |

## Confusion Matrix

- True Negatives (Legitimate predicted Legitimate): **51**
- False Positives (Legitimate predicted Phishing): **0**
- False Negatives (Phishing predicted Legitimate): **0**
- True Positives (Phishing predicted Phishing): **39**

## Top 10 Feature Importances

| Feature | Importance |
|---|---|
| `has_https` | 27.98% |
| `num_hyphens` | 16.94% |
| `hostname_length` | 13.21% |
| `url_length` | 10.99% |
| `hostname_hyphen_count` | 7.47% |
| `path_length` | 5.34% |
| `num_slashes` | 4.49% |
| `path_depth` | 3.98% |
| `has_suspicious_keywords` | 2.37% |
| `num_subdomains` | 1.59% |
