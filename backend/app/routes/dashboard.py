"""
Dashboard API Endpoints.
"""

from fastapi import APIRouter, Depends
from pymongo.database import Database

from app.schemas.detection import DashboardStats
from app.dependencies import get_db, get_current_user
from app.services.detection_service import get_dashboard_metrics

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get(
    "/stats",
    response_model=DashboardStats,
    summary="Get aggregated dashboard statistics",
    description="Returns real-time analytics including total scans, threat counts, risk distributions, and weekly scan timeline."
)
def get_stats(
    current_user: dict = Depends(get_current_user),
    db: Database = Depends(get_db)
):
    stats = get_dashboard_metrics(db=db, user_id=current_user["id"])
    return stats
