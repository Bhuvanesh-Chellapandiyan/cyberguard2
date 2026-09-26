"""
Application Configuration.
Loads environment variables and sets sensible defaults for development and production.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env if present
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)


class Settings:
    PROJECT_NAME: str = "Phishing Website Detector API"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"

    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # Database
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    MONGODB_DB_NAME: str = os.getenv("MONGODB_DB_NAME", "phishing_detector")

    # Security & JWT
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super-secret-cyberguard-jwt-key-2026-prod-ready")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = int(os.getenv("JWT_EXPIRE_MINUTES", "120"))

    # CORS
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")

    # ML Model
    ML_MODEL_PATH: str = os.getenv(
        "ML_MODEL_PATH",
        str(Path(__file__).resolve().parent / "ml" / "phishing_model.joblib")
    )
    ML_METADATA_PATH: str = os.getenv(
        "ML_METADATA_PATH",
        str(Path(__file__).resolve().parent / "ml" / "model_metadata.json")
    )

    # Demo / Admin Seed
    ADMIN_EMAIL: str = os.getenv("ADMIN_EMAIL", "admin@cyberguard.org")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "CyberGuard@2026!")


settings = Settings()
