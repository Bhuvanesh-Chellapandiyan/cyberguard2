# System Architecture & Technical Design

## 1. Executive Summary
The **Phishing Website Detector** is a full-stack, enterprise-grade cybersecurity intelligence platform developed as a B.Tech Artificial Intelligence and Data Science mini-project. The system detects malicious phishing and spoofed URLs using Machine Learning without visiting or executing untrusted URLs on the server.

---

## 2. High-Level Architectural Flow

```
[ User Browser / Analyst ]
            │
            ▼
[ React + Vite Single Page Application ]
            │  (REST API with JWT Bearer Token / HTTPS)
            ▼
[ FastAPI Application Server ]
    ├── Middleware (CORS, Request Validation, Exception Handler)
    ├── Authentication Service (Bcrypt Password Hashing & JWT)
    ├── Detection Orchestrator
    │       ├── Lexical URL Parsing & Normalization
    │       ├── 22-Feature Extractor
    │       ├── Scikit-Learn Random Forest Classifier (Cached in Memory)
    │       └── Explainable AI (XAI) Rule Engine
    └── Persistence Service
            ▼
   [ MongoDB Atlas / Local MongoDB ]
       ├── `users` Collection (Unique email, Bcrypt hash, Role)
       └── `scans` Collection (User ID, URL, Feature Vector, Rationale, Metrics)
```

---

## 3. Component Breakdown

### 3.1 Client Tier (Frontend)
- **Framework:** React 19 with Vite 8.
- **Styling:** Tailwind CSS v4, custom glassmorphism, responsive cyber dark theme.
- **Routing:** React Router v7 with Protected Route guards.
- **Data Fetching:** Axios instance with automatic JWT Bearer header injection and 401 session expiration interceptors.
- **Visualizations:** Recharts for dynamic threat distribution donuts, 7-day volume timelines, and risk tier distribution.

### 3.2 Application Tier (Backend)
- **Framework:** FastAPI with Python 3.13 / 3.11.
- **Asynchronous Server:** Uvicorn with connection pooling.
- **Schema Validation:** Pydantic v2 with strict URL sanitization and regex validation.
- **Security:** Bcrypt (12 work rounds) for one-way password hashing; PyJWT for stateless HMAC-SHA256 bearer tokens.
- **Lifespan Manager:** Pre-loads the trained Random Forest model and metadata into memory at startup (singleton pattern) to ensure zero-latency predictions (< 25ms).

### 3.3 Machine Learning Tier
- **Algorithm:** Random Forest Classifier (100 Decision Trees, `max_depth=12`, `random_state=42`).
- **Feature Pipeline:** 22 engineered lexical and structural URL attributes.
- **Model Serialization:** Joblib (`phishing_model.joblib`) with versioned metadata (`model_metadata.json`).
- **Explainability:** Feature-grounded XAI engine producing human-readable rationales directly correlating to active decision branches.

### 3.4 Data Tier (MongoDB)
- **Collections:**
  - `users`: Stores user identity, hashed passwords, roles (`user`, `admin`), and timestamps.
  - `scans`: Stores scan requests, predictions, confidence percentages, feature dictionaries, rationales, and timestamps.
- **Indexes:**
  - `users.email` (Unique index)
  - `scans.user_id` (Query index)
  - `scans.created_at` (Descending index)
  - `scans.prediction` (Classification index)
- **Resilience:** Gracefully falls back to an in-memory MongoMock database if an external instance is offline during local reviews, ensuring uninterrupted demonstration.
