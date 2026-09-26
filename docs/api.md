# REST API Specification & Endpoints

## 1. Overview
The CyberGuard backend exposes a comprehensive RESTful API under the `/api` prefix. Interactive OpenAPI documentation is automatically available at `/docs` (Swagger UI) and `/redoc` (ReDoc).

Base URL:
- Local Development: `http://localhost:8000/api`
- Production: `https://<YOUR-RENDER-OR-RAILWAY-DOMAIN>/api`

---

## 2. Authentication Standard
- **Strategy:** JSON Web Token (JWT) Bearer Authorization.
- **Header Format:** `Authorization: Bearer <JWT_ACCESS_TOKEN>`
- **Token Expiry:** Configurable via `JWT_EXPIRE_MINUTES` (Default: 120 minutes).

---

## 3. API Endpoint Catalog

### 3.1 Authentication Routes (`/api/auth`)

#### `POST /api/auth/register`
Creates a new user account and returns a signed JWT.
- **Request Body:**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "Password123!",
    "confirm_password": "Password123!"
  }
  ```
- **Responses:**
  - `201 Created`: Returns access token and user profile object.
  - `400 Bad Request`: Email already exists or passwords mismatch.
  - `422 Unprocessable Content`: Schema validation failure.

#### `POST /api/auth/login`
Authenticates credentials and returns a signed JWT.
- **Request Body:**
  ```json
  {
    "email": "jane@example.com",
    "password": "Password123!"
  }
  ```
- **Responses:**
  - `200 OK`: Returns access token and user profile object.
  - `401 Unauthorized`: Invalid credentials.

#### `GET /api/auth/me`
Retrieves identity profile and scan count for the active token bearer.
- **Headers:** `Authorization: Bearer <token>`
- **Responses:** `200 OK`, `401 Unauthorized`.

#### `POST /api/auth/logout`
Explicitly terminates client session.
- **Headers:** `Authorization: Bearer <token>`
- **Responses:** `200 OK`.

---

### 3.2 URL Detection Routes (`/api`)

#### `POST /api/detect`
Performs feature extraction, Random Forest classification, and XAI reasoning on a target URL. Automatically saves the scan if authenticated.
- **Request Body:**
  ```json
  {
    "url": "https://example.com/login"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "id": "6651a14831a2ef490bc1e205",
    "url": "https://example.com/login",
    "prediction": "LEGITIMATE",
    "confidence": 98.42,
    "risk_level": "LOW",
    "features": {
      "url_length": 26,
      "hostname_length": 11,
      "path_length": 6,
      "num_dots": 1,
      "num_hyphens": 0,
      "num_underscores": 0,
      "num_slashes": 3,
      "num_question_marks": 0,
      "num_equals": 0,
      "num_at": 0,
      "num_ampersands": 0,
      "num_special_chars": 0,
      "num_digits": 0,
      "num_subdomains": 0,
      "has_https": 1,
      "has_ip": 0,
      "has_suspicious_keywords": 1,
      "is_shortened": 0,
      "hostname_hyphen_count": 0,
      "path_depth": 1,
      "has_port": 0,
      "ratio_digits_url": 0.0
    },
    "reasons": [
      "Protected by standard HTTPS encryption protocol.",
      "Uses a standard, human-readable domain name with no raw IP address.",
      "Direct destination URL with no obfuscating shortening service."
    ],
    "created_at": "2026-09-24T05:20:00.000Z"
  }
  ```

#### `GET /api/detections`
Retrieves paginated scan history for the authenticated user.
- **Query Parameters:**
  - `search`: Substring search in URL.
  - `prediction`: `PHISHING` or `LEGITIMATE`.
  - `risk_level`: `LOW`, `MEDIUM`, or `HIGH`.
  - `page`: Page index (default: 1).
  - `limit`: Items per page (default: 20, max: 100).
- **Responses:** `200 OK`, `401 Unauthorized`.

#### `GET /api/detections/{id}`
Returns all details and features for a specific scan ID.
- **Responses:** `200 OK`, `404 Not Found`.

#### `DELETE /api/detections/{id}`
Deletes a scan record belonging to the authenticated user.
- **Responses:** `200 OK`, `404 Not Found`.

---

### 3.3 Dashboard Routes (`/api/dashboard`)

#### `GET /api/dashboard/stats`
Calculates aggregated telemetry for dashboard visualizations:
- Total scans, phishing scans, legitimate scans.
- Average confidence score.
- Threat level distribution (`LOW`, `MEDIUM`, `HIGH`).
- 7-day scan timeline grouped by date.
- 5 most recent scans.

---

### 3.4 Profile Routes (`/api/profile`)

#### `GET /api/profile`
Fetches user details and total scan count.

#### `PUT /api/profile`
Updates user name or changes password (verifying existing password).

---

### 3.5 System Routes

#### `GET /api/health`
Health check endpoint reporting application and database connectivity.
```json
{
  "status": "ok",
  "database": "connected",
  "model": "loaded",
  "version": "1.0.0",
  "environment": "development"
}
```
