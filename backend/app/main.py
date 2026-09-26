"""
Phishing Website Detector - FastAPI Backend Application.
Entry point for the REST API server.
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.encoders import jsonable_encoder

from app.config import settings
from app.database import connect_to_database, close_database, is_database_mock
from app.services.auth_service import seed_admin_user
from app.ml.model_loader import get_model
from app.routes.auth import router as auth_router
from app.routes.detection import router as detection_router
from app.routes.dashboard import router as dashboard_router
from app.routes.profile import router as profile_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("phishing_detector")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup:
    logger.info("Initializing CyberGuard Phishing Detector Backend...")
    db = connect_to_database()
    try:
        seed_admin_user(db)
        logger.info("Default admin verification completed.")
    except Exception as e:
        logger.warning(f"Admin seeding notice: {e}")

    try:
        get_model()
        logger.info("ML inference model warmed up and ready.")
    except Exception as e:
        logger.error(f"Failed to pre-load ML model: {e}")

    yield

    # Shutdown:
    logger.info("Shutting down backend services...")
    close_database()


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Full-stack AI/ML Phishing Website Detection REST API with Explainable AI (XAI) and JWT Authentication.",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
origins = [
    settings.FRONTEND_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]
# Clean trailing slashes
origins = list(set([o.rstrip("/") for o in origins if o]))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global Exception Handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    msg = errors[0]["msg"] if errors else "Invalid request data."
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"success": False, "message": str(msg), "details": jsonable_encoder(errors)}
    )


# Health Check
@app.get("/api/health", tags=["System"])
def health_check():
    db_status = "in-memory-mock" if is_database_mock() else "connected"
    return {
        "status": "ok",
        "database": db_status,
        "model": "loaded",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT
    }


# Root information endpoint
@app.get("/", tags=["System"])
def root():
    return {
        "message": "CyberGuard Phishing Website Detector API is operational.",
        "documentation": "/docs",
        "health": "/api/health"
    }


# Include Routers with standard /api prefix
app.include_router(auth_router, prefix=settings.API_PREFIX)
app.include_router(detection_router, prefix=settings.API_PREFIX)
app.include_router(dashboard_router, prefix=settings.API_PREFIX)
app.include_router(profile_router, prefix=settings.API_PREFIX)
