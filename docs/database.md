# MongoDB Database Design & Data Modeling

## 1. Overview
The system uses **MongoDB** as its primary NoSQL document store. MongoDB was selected for its high write throughput, native JSON document compatibility, flexible schema design for feature vectors, and fast indexing.

Database Name: `phishing_detector`

---

## 2. Collections & Document Schemas

### 2.1 `users` Collection
Stores authenticated user accounts.

```json
{
  "_id": ObjectId("6651a02931a2ef490bc1e101"),
  "name": "Alex Mercer",
  "email": "alex.mercer@cyberguard.local",
  "password_hash": "$2b$12$e9z5vK8e3F1N5vB7nJ6uRe.XbM2W1K5yP...",
  "role": "analyst",
  "created_at": ISODate("2026-09-24T05:00:00.000Z"),
  "updated_at": ISODate("2026-09-24T05:00:00.000Z")
}
```

#### Field Specifications:
- `_id`: Auto-generated BSON primary key.
- `name`: String, 2 to 100 characters.
- `email`: String, normalized to lowercase, guaranteed unique via index.
- `password_hash`: String, 60-character Bcrypt hash. Plaintext passwords are never stored or logged.
- `role`: String enum (`user`, `admin`).
- `created_at` / `updated_at`: UTC timestamps.

---

### 2.2 `scans` Collection
Stores every URL analyzed by registered users.

```json
{
  "_id": ObjectId("6651a14831a2ef490bc1e205"),
  "user_id": ObjectId("6651a02931a2ef490bc1e101"),
  "url": "http://192.168.1.1/banking/login.php",
  "prediction": "PHISHING",
  "confidence": 95.00,
  "risk_level": "HIGH",
  "features": {
    "url_length": 37,
    "hostname_length": 11,
    "path_length": 18,
    "num_dots": 4,
    "num_hyphens": 0,
    "num_underscores": 0,
    "num_slashes": 3,
    "num_question_marks": 0,
    "num_equals": 0,
    "num_at": 0,
    "num_ampersands": 0,
    "num_special_chars": 0,
    "num_digits": 8,
    "num_subdomains": 0,
    "has_https": 0,
    "has_ip": 1,
    "has_suspicious_keywords": 1,
    "is_shortened": 0,
    "hostname_hyphen_count": 0,
    "path_depth": 3,
    "has_port": 0,
    "ratio_digits_url": 0.2162
  },
  "reasons": [
    "URL uses a raw IP address instead of a registered domain name (common in evasion attacks).",
    "Contains targeted authentication/security keywords frequently abused in credential harvesting.",
    "Lacks HTTPS encryption; transport layer security is absent."
  ],
  "created_at": ISODate("2026-09-24T05:15:30.000Z")
}
```

---

## 3. Indexes & Performance Optimization

To achieve sub-millisecond query latency across thousands of records, the following compound and single indexes are applied on startup:

| Collection | Key Pattern | Type | Purpose |
|---|---|---|---|
| `users` | `{"email": 1}` | Unique | Prevents duplicate registration & accelerates login lookups |
| `scans` | `{"user_id": 1}` | Standard | Filters scan history strictly by authenticated user |
| `scans` | `{"created_at": -1}` | Descending | Powers reverse-chronological dashboard feeds & pagination |
| `scans` | `{"prediction": 1}` | Standard | Accelerates aggregation pipelines for statistics cards |

---

## 4. Connection Lifecycle & Pooling
- Uses `pymongo.MongoClient` with `maxPoolSize=50` and `minPoolSize=5`.
- A singleton database manager reuses active sockets instead of recreating connections on every HTTP request.
- Automated graceful fallback to `mongomock` ensures offline viva demonstrations function seamlessly without requiring a running MongoDB server.
