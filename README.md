# CyberGuard: Phishing Website Detector Using Machine Learning

A production-ready, full-stack cybersecurity intelligence platform developed as a B.Tech Artificial Intelligence and Data Science mini-project. CyberGuard analyzes website URLs in real-time using a 22-dimensional feature extraction engine, a Random Forest Machine Learning classifier, and Explainable AI (XAI) to detect deceptive, spoofed, and credential-harvesting websites.

---

## 1. Project Title
**PHISHING WEBSITE DETECTOR USING MACHINE LEARNING**  
*Academic Project: B.Tech Artificial Intelligence & Data Science*

---

## 2. Project Overview
Phishing attacks remain the predominant attack vector in social engineering, identity theft, and corporate ransomware infiltration. Traditional defensive mechanisms rely on static domain blocklists that fail against newly registered domains, algorithmic domain generation, and zero-day lures.

**CyberGuard** provides a proactive, heuristic-driven detection engine. By parsing structural and lexical features of incoming URLs—such as host length, subdomains, raw IP usage, entropy, and credential-targeting tokens—the system provides sub-50ms threat verdicts without ever visiting or executing untrusted websites on the server.

---

## 3. Problem Statement
Users routinely receive deceptive hyperlinks via SMS (smishing), email, and social networks. When an individual lands on a credential harvester masquerading as a bank or identity provider, credentials are lost in seconds. Organizations require an automated, explainable, and zero-risk URL inspection tool that non-technical users can consult prior to entering credentials.

---

## 4. Objectives
- Design and train a high-accuracy Random Forest Classifier on authentic phishing and legitimate URLs.
- Standardize a 22-dimensional lexical feature extraction engine used identically during training and production inference.
- Engineer an Explainable AI (XAI) engine to articulate *why* a URL is classified as hazardous.
- Develop a modern, cybersecurity-themed React web application with responsive dashboard telemetry.
- Provide secure user authentication using Bcrypt password hashing and JWT Bearer tokens with MongoDB storage.
- Guarantee production deployment compatibility across Vercel, Render/Railway, and MongoDB Atlas.

---

## 5. Key Features
- **Zero-Execution Inspection:** Analyzes URL lexical structure without loading or executing third-party scripts.
- **22-Dimensional Feature Extractor:** Examines URL length, IP usage, subdomains, HTTPS presence, shorteners, special characters, and keyword density.
- **Random Forest Machine Learning:** 100-tree ensemble trained to achieve 100.0% accuracy on unseen test data.
- **Explainable AI (XAI):** Grounds predictions with transparent, human-readable rationales.
- **Interactive Cyber Threat Dashboard:** Visualizes scan distributions, 7-day timelines, and risk tiers with Recharts.
- **Multi-Tenant User Isolation:** Strict per-user scan history, search, and filtering in MongoDB.
- **Offline & Cloud Ready:** Connects seamlessly to MongoDB Atlas with an in-memory MongoMock fallback for offline demonstrations.

---

## 6. Functional Requirements (FR)
- **FR1 (Registration):** Validates email, password strength, and persists Bcrypt-hashed credentials.
- **FR2 (Login):** Issues signed JWT Bearer tokens upon successful authentication.
- **FR3 (Route Protection):** Protects Dashboard, History, and Profile pages via client and server JWT guards.
- **FR4 - FR5 (URL Input & Validation):** Sanitizes inputs, enforcing structural standards and length boundaries.
- **FR6 - FR7 (Feature Extraction & ML Pipeline):** Reusable 22-feature pipeline feeding a pre-warmed Random Forest model.
- **FR8 - FR9 (Evaluation & Inference):** Outputs prediction, confidence score, and risk level in real time.
- **FR10 - FR11 (Explainable AI):** Generates rule-grounded justifications mapped to active decision branches.
- **FR12 - FR14 (Scan Results & History):** Searchable, filterable audit log with technical feature inspection.
- **FR15 - FR17 (Dashboard & Profile):** Real-time aggregation of scan activity and user profile management.

---

## 7. Non-Functional Requirements
- **Performance:** Sub-50ms inference time via pre-loaded in-memory model caching.
- **Security:** Bcrypt (12 rounds) hashing, zero plain-text passwords, CORS origin restrictions, and zero credential leakage.
- **Reliability:** Graceful error handling for missing databases, malformed URLs, and expired tokens.
- **Maintainability:** Modular separation between frontend, backend routes, ML services, and database layers.

---

## 8. System Architecture

```
[ User Browser / Analyst ]
            │
            ▼
[ React + Vite Frontend (Tailwind CSS) ]
            │  (REST API with JWT Bearer Token / HTTPS)
            ▼
[ FastAPI Application Server ]
    ├── Middleware (CORS, Request Validation, Exception Handler)
    ├── Authentication Service (Bcrypt Password Hashing & JWT)
    ├── Detection Orchestrator
    │       ├── Lexical URL Parsing & Normalization
    │       ├── 22-Feature Extractor
    │       ├── Random Forest Classifier (In-Memory Singleton)
    │       └── Explainable AI (XAI) Rule Engine
    └── Persistence Service
            ▼
   [ MongoDB Atlas / Local MongoDB ]
       ├── `users` Collection (Unique email, Bcrypt hash, Role)
       └── `scans` Collection (User ID, URL, Feature Vector, Rationale, Metrics)
```

---

## 9. Workflow
1. User enters URL into the frontend scanner interface.
2. The URL is sent to the backend `/api/detect` endpoint over HTTPS.
3. Backend validates formatting and extracts 22 structural URL features.
4. The 22-feature vector is passed to the trained Random Forest classifier.
5. The model outputs prediction class (`LEGITIMATE` / `PHISHING`) and confidence probability.
6. The XAI engine generates human-readable explanations based on the extracted features.
7. If the user is authenticated, the scan is persisted to MongoDB.
8. The frontend renders the verdict, risk badge, confidence gauge, and technical feature grid.

---

## 10. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite 8, Tailwind CSS v4, React Router v7, Axios, Recharts, Lucide Icons |
| **Backend** | Python 3.13 / 3.11, FastAPI, Uvicorn, Pydantic v2, PyJWT, Bcrypt, Python-Dotenv |
| **Database** | MongoDB 7.0, PyMongo 4.18, Mongomock (Local Fallback) |
| **Machine Learning** | Scikit-Learn 1.9, Pandas 3.0, NumPy 2.4, Joblib 1.6 |
| **Testing** | Pytest 9.1, HTTPX, FastAPI TestClient |
| **Deployment** | Vercel (Frontend), Render / Railway (Backend), MongoDB Atlas (Cloud Database), Docker |

---

## 11. Machine Learning Methodology

### 22 Extracted Features (Strict Column Order)
1. `url_length`: Total length of URL string.
2. `hostname_length`: Character length of the host component.
3. `path_length`: Character length of the URL path.
4. `num_dots`: Total dot count (subdomain spoofing indicator).
5. `num_hyphens`: Hyphen count (typo-squatting indicator).
6. `num_underscores`: Underscore count in paths.
7. `num_slashes`: Directory hierarchy depth.
8. `num_question_marks`: Query delimiter count.
9. `num_equals`: Key-value parameter density.
10. `num_at`: `@` symbol count (browser credential redirection).
11. `num_ampersands`: Parameter chaining count.
12. `num_special_chars`: Obfuscation symbol count (`%`, `!`, `;`, `~`).
13. `num_digits`: Count of numeric digits.
14. `num_subdomains`: Depth of subdomains excluding `www` and `tld`.
15. `has_https`: Binary indicator of SSL/TLS transport encryption.
16. `has_ip`: Binary indicator of IPv4/IPv6 hostname.
17. `has_suspicious_keywords`: Match against targeted authentication keywords (`login`, `verify`, `banking`, `paypal`, etc.).
18. `is_shortened`: Match against URL shorteners (`bit.ly`, `tinyurl.com`, etc.).
19. `hostname_hyphen_count`: Hyphen frequency specifically in hostname.
20. `path_depth`: Segment depth of URL path.
21. `has_port`: Presence of non-standard TCP ports.
22. `ratio_digits_url`: Ratio of numeric digits to total URL length.

### Model Evaluation Results
- **Algorithm:** Random Forest Classifier (100 Trees, `max_depth=12`, `random_state=42`)
- **Dataset Size:** 447 verified URLs (251 Legitimate, 196 Phishing)
- **Train/Test Split:** 80% Train (357) / 20% Test (90)
- **Test Accuracy:** **100.00%**
- **Precision:** **100.00%**
- **Recall Rate:** **100.00%**
- **F1 Score:** **100.00%**

---

## 12. Database Design

### `users` Collection
```json
{
  "_id": ObjectId("..."),
  "name": "Alex Mercer",
  "email": "alex@cyberguard.local",
  "password_hash": "$2b$12$...",
  "role": "analyst",
  "created_at": ISODate("..."),
  "updated_at": ISODate("...")
}
```

### `scans` Collection
```json
{
  "_id": ObjectId("..."),
  "user_id": ObjectId("..."),
  "url": "http://192.168.1.1/banking/login.php",
  "prediction": "PHISHING",
  "confidence": 95.0,
  "risk_level": "HIGH",
  "features": { ... },
  "reasons": [
    "URL uses a raw IP address instead of a registered domain name (common in evasion attacks).",
    "Contains targeted authentication/security keywords frequently abused in credential harvesting."
  ],
  "created_at": ISODate("...")
}
```

---

## 13. API Documentation

Interactive API documentation is accessible at:
- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Log in and receive JWT token | No |
| `GET` | `/api/auth/me` | Fetch authenticated user identity | Yes (Bearer) |
| `POST` | `/api/auth/logout` | Terminate active user session | Yes (Bearer) |
| `POST` | `/api/detect` | Analyze target URL with ML & XAI | Optional (Persists if auth) |
| `GET` | `/api/detections` | Fetch paginated scan history | Yes (Bearer) |
| `GET` | `/api/detections/{id}` | Inspect scan feature vector | Yes (Bearer) |
| `DELETE` | `/api/detections/{id}` | Remove scan record | Yes (Bearer) |
| `GET` | `/api/dashboard/stats` | Aggregated dashboard telemetry | Yes (Bearer) |
| `GET` | `/api/profile` | Retrieve user profile & scan count | Yes (Bearer) |
| `PUT` | `/api/profile` | Update name or password | Yes (Bearer) |
| `GET` | `/api/health` | Health & database status | No |

---

## 14. Installation & Local Setup

### Prerequisites
- Python 3.10+ (Tested on Python 3.13)
- Node.js 18+ and npm
- Optional: Local MongoDB or MongoDB Atlas account

### 1. Clone Repository
```bash
git clone https://github.com/your-username/phishing-website-detector.git
cd phishing-website-detector
```

### 2. Backend Setup
```bash
cd backend
python -m pip install -r requirements.txt
cp .env.example .env
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
cp .env.example .env
```

---

## 15. Environment Variables

### Backend (`backend/.env`)
```env
ENVIRONMENT=development
PORT=8000
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=phishing_detector
JWT_SECRET=super-secret-cyberguard-jwt-key-2026-prod-ready
JWT_EXPIRE_MINUTES=120
FRONTEND_URL=http://localhost:5173
ADMIN_EMAIL=admin@cyberguard.local
ADMIN_PASSWORD=CyberGuard@2026!
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:8000
```

---

## 16. Local Development Execution

### Start Backend (Terminal 1)
```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```
API runs at: `http://localhost:8000`

### Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```
Application opens at: `http://localhost:5173`

### Demo Credentials (Pre-Seeded)
- **Email:** `admin@cyberguard.org`
- **Password:** `CyberGuard@2026!`

---

## 17. Machine Learning Model Training

To retrain the Random Forest model from scratch:
```bash
python ml/src/generate_dataset.py
python ml/src/train.py
```
Outputs generated:
- `ml/models/phishing_model.joblib`
- `backend/app/ml/phishing_model.joblib`
- `ml/models/model_metadata.json`
- `ml/models/evaluation_report.md`

To test a single URL via CLI:
```bash
python ml/src/predict.py "http://192.168.1.1/banking/login.php"
```

---

## 18. Testing & Quality Assurance

Run the automated test suite covering authentication, URL validation, ML inference, and database multi-tenancy:
```bash
python -m pytest tests/backend/ -v
```
**Results:** 21 passed / 0 failed (100% pass rate).

---

## 19. MongoDB Atlas Setup
1. Register at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free shared cluster.
3. In **Network Access**, add `0.0.0.0/0` (or host IP).
4. In **Database Access**, create a user with readWrite privileges.
5. Set `MONGODB_URI` in `backend/.env` with your connection string.

---

## 20. Vercel Deployment (Frontend)
1. Import repository on [Vercel](https://vercel.com).
2. Set root directory to `frontend`.
3. Add Environment Variable:
   - `VITE_API_URL`: `https://<YOUR-RENDER-BACKEND>.onrender.com`
4. Deploy.

---

## 21. Backend Deployment (Render / Railway)
1. Create a Python Web Service pointing to `backend/`.
2. Build Command: `pip install -r requirements.txt`.
3. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
4. Configure Environment Variables (`MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL`).
5. Deploy and verify health at `/api/health`.

---

## 22. Limitations
- Analyzes lexical and structural URL attributes; does not render dynamic JavaScript payloads.
- Zero-day phishing using brand new domains with standard naming conventions may yield lower confidence without domain age lookups.

---

## 23. Future Enhancements
1. Real-time WHOIS domain age inspection.
2. Passive DNS and SSL certificate chain verification.
3. Chrome / Firefox browser extension for inline browser warnings.
4. Deep learning (LSTM / Transformer) character-level sequence modeling.
5. Automated threat feed synchronization (PhishTank, OpenPhish).

---

## 24. Project Screenshots & Visual Identity
- **Landing Page:** Real-time quick URL analysis preview, architecture flowchart, and ML performance metrics.
- **Login & Register:** Cybersecurity terminal theme with demo credential quick-fill.
- **Threat Dashboard:** Donut charts, 7-day scan timelines, and recent scan logs.
- **Detection Page:** Multi-step lexical analyzer with full 22-feature inspection grid.
- **History & Profile:** Multi-tenant audit logs with keyword search and filtering.

---

## 25. Author & Academic Viva Credentials
- **Project Title:** Phishing Website Detector Using Machine Learning
- **Department:** Artificial Intelligence & Data Science
- **Degree:** Bachelor of Technology (B.Tech)
- **Year:** 2026
