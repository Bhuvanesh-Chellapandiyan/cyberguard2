"""
Detection API Endpoints.
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pymongo.database import Database

from app.schemas.detection import DetectRequest, DetectResult, DetectionListResponse
from app.dependencies import get_db, get_current_user, get_optional_user
from app.services.detection_service import (
    analyze_url,
    get_user_scans,
    get_scan_by_id,
    delete_scan_by_id
)

router = APIRouter(tags=["URL Detection"])


@router.post(
    "/detect",
    response_model=DetectResult,
    status_code=status.HTTP_200_OK,
    summary="Analyze URL for Phishing or Legitimate characteristics",
    description="Extracts 22 engineered features, performs Random Forest ML inference, generates explainable rationales, and persists record to MongoDB."
)
def detect_url(
    req: DetectRequest,
    current_user: Optional[dict] = Depends(get_optional_user),
    db: Database = Depends(get_db)
):
    user_id = current_user.get("id") if current_user else None
    try:
        result = analyze_url(url=req.url, user_id=user_id, db=db)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference error during URL inspection: {str(e)}"
        )


@router.get(
    "/detections",
    response_model=DetectionListResponse,
    summary="Get user scan history",
    description="Retrieves a paginated list of URL scans for the authenticated user, supporting search and filtering."
)
def list_detections(
    search: Optional[str] = Query(None, description="Search by URL substring"),
    prediction: Optional[str] = Query(None, description="Filter by PHISHING or LEGITIMATE"),
    risk_level: Optional[str] = Query(None, description="Filter by LOW, MEDIUM, or HIGH"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    current_user: dict = Depends(get_current_user),
    db: Database = Depends(get_db)
):
    return get_user_scans(
        db=db,
        user_id=current_user["id"],
        search=search,
        prediction=prediction,
        risk_level=risk_level,
        page=page,
        limit=limit
    )


@router.get(
    "/detections/{scan_id}",
    response_model=DetectResult,
    summary="Get individual scan detail",
    description="Fetches full details including all extracted features for a specific scan ID."
)
def get_detection(
    scan_id: str,
    current_user: dict = Depends(get_current_user),
    db: Database = Depends(get_db)
):
    scan = get_scan_by_id(db=db, scan_id=scan_id, user_id=current_user["id"])
    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan record not found or does not belong to the current user."
        )
    return scan


@router.delete(
    "/detections/{scan_id}",
    summary="Delete a scan record",
    description="Deletes a specific scan record from the user's history."
)
def delete_detection(
    scan_id: str,
    current_user: dict = Depends(get_current_user),
    db: Database = Depends(get_db)
):
    success = delete_scan_by_id(db=db, scan_id=scan_id, user_id=current_user["id"])
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan record not found or already deleted."
        )
    return {"success": True, "message": "Scan record deleted successfully."}
