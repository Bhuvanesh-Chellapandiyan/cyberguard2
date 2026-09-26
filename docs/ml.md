# Machine Learning Methodology & Explainable AI (XAI)

## 1. Problem Formulation
Phishing websites mimic legitimate online banking, social media, government, and e-commerce portals to steal sensitive credentials and credit card information. Traditional defensive measures rely on static blacklists, which fail against newly registered domains, algorithmic domain generation, and fast-flux networks.

Our Machine Learning approach analyzes the **lexical structure and domain patterns of URLs** using a supervised Random Forest classification pipeline, achieving high accuracy with zero server risk (no HTTP requests are dispatched to malicious servers).

---

## 2. 22-Feature Engineering Specification

The feature extraction logic (`ml/src/feature_extractor.py`) extracts an identical, strictly ordered 22-dimensional feature vector during both offline training and online API inference:

| Index | Feature Name | Type | Description | Security Significance |
|---|---|---|---|---|
| 0 | `url_length` | int | Total character length of URL | Phishing URLs are frequently elongated to obscure hostnames |
| 1 | `hostname_length` | int | Total character length of hostname | Long hostnames indicate complex nested subdomains |
| 2 | `path_length` | int | Length of URL path component | Deep folder structures mimic authentic portal trees |
| 3 | `num_dots` | int | Count of `.` characters | Excessive dots indicate spoofed subdomains (e.g. `paypal.com.account-update.xyz`) |
| 4 | `num_hyphens` | int | Count of `-` characters | Hyphens are widely used in typo-squatting (`chase-bank-verify.com`) |
| 5 | `num_underscores` | int | Count of `_` characters | Underscores appear frequently in obfuscated script paths |
| 6 | `num_slashes` | int | Count of `/` characters | Indicates directory hierarchy depth |
| 7 | `num_question_marks`| int | Count of `?` characters | Indicates query string presence |
| 8 | `num_equals` | int | Count of `=` characters | Key-value parameter density |
| 9 | `num_at` | int | Count of `@` characters | The `@` symbol causes browser credential redirection |
| 10 | `num_ampersands` | int | Count of `&` characters | Multi-token parameter chaining |
| 11 | `num_special_chars` | int | Count of symbols outside standard set | Obfuscation markers (e.g. `%`, `;`, `~`) |
| 12 | `num_digits` | int | Count of numeric characters `0-9` | Malicious domains use random hex or number sequences |
| 13 | `num_subdomains` | int | Subdomain level depth excluding `www` and `tld` | Excessive subdomains spoof trust |
| 14 | `has_https` | binary | 1 if URL scheme is HTTPS, 0 otherwise | Absence of SSL/TLS certificate transport security |
| 15 | `has_ip` | binary | 1 if hostname is an IPv4/IPv6 address, 0 otherwise | Malicious infrastructure bypasses DNS via raw IP addresses |
| 16 | `has_suspicious_keywords` | binary | Presence of tokens (`login`, `verify`, `banking`, `paypal`, etc.) | Targets credential theft lures |
| 17 | `is_shortened` | binary | 1 if domain matches URL shortener (e.g. `bit.ly`, `tinyurl`) | Shorteners hide the genuine destination hostname |
| 18 | `hostname_hyphen_count` | int | Hyphen count strictly within hostname | Distinguishes domain spoofing from legitimate paths |
| 19 | `path_depth` | int | Segment depth in URL path | Indicates file hierarchy complexity |
| 20 | `has_port` | binary | 1 if non-standard port is specified | Attackers often host phishing pages on arbitrary ports |
| 21 | `ratio_digits_url` | float | Ratio of digits to total URL length | Automated attack domains exhibit high digit density |

---

## 3. Machine Learning Algorithm: Random Forest Classifier
The Random Forest Classifier was selected over alternatives (e.g. SVM, Logistic Regression, Naive Bayes) because:
1. **Non-Linear Decision Boundaries:** URL features exhibit complex interactions (e.g., high length + no HTTPS + subdomains).
2. **Robustness to Overfitting:** Ensemble bagging of 100 decorrelated decision trees reduces variance.
3. **Interpretability & Feature Importance:** Computes Gini-impurity reduction per feature, enabling direct explainability.
4. **Fast Inference Time:** Tree traversal runs in under 5 milliseconds on modern CPUs.

### Hyperparameters:
```python
RandomForestClassifier(
    n_estimators=100,
    max_depth=12,
    min_samples_split=3,
    min_samples_leaf=1,
    random_state=42,
    n_jobs=-1
)
```

---

## 4. Empirical Evaluation Results

Evaluated on an unseen, stratified 20% test split:
- **Total Dataset:** 447 samples (251 Legitimate, 196 Phishing)
- **Train Set:** 357 samples | **Test Set:** 90 samples

### Metrics:
| Metric | Test Set Score |
|---|---|
| **Accuracy** | **100.00%** |
| **Precision** | **100.00%** |
| **Recall Rate** | **100.00%** |
| **F1 Score** | **100.00%** |

### Confusion Matrix:
```
                Predicted Legitimate    Predicted Phishing
Actual Legitimate       51 (TN)                 0 (FP)
Actual Phishing          0 (FN)                39 (TP)
```

### Top 5 Most Important Features:
1. `has_https`: 27.98%
2. `num_hyphens`: 16.94%
3. `hostname_length`: 13.21%
4. `url_length`: 10.99%
5. `hostname_hyphen_count`: 7.47%

---

## 5. Explainable AI (XAI) Implementation
Rather than acting as an opaque black box, the inference service triggers grounded, feature-based explanations (`app/services/explanation_service.py`):
- Highlighting missing HTTPS protocol.
- Identifying raw IP address hosts.
- Flagging multiple nested subdomains.
- Detecting targeted credential-harvesting tokens.
- Exposing shortened URLs.
