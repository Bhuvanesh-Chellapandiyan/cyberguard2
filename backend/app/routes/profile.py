"""
User Profile API Endpoints.
"""

from datetime import datetime, timezone
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.database import Database

from app.schemas.auth import UserResponse, ProfileUpdateRequest
from app.dependencies import get_db, get_current_user
from app.services.auth_service import verify_password, hash_password, get_user_by_id

router = APIRouter(prefix="/profile", tags=["User Profile"])


@router.get(
    "",
    response_model=UserResponse,
    summary="Get user profile",
    description="Returns authenticated user information with total scan count."
)
def get_profile(
    current_user: dict = Depends(get_current_user),
    db: Database = Depends(get_db)
):
    total = db.scans.count_documents({"user_id": ObjectId(current_user["id"])})
    current_user["total_scans"] = total
    return current_user


@router.put(
    "",
    response_model=UserResponse,
    summary="Update profile details",
    description="Updates user name or updates password after validating current password."
)
def update_profile(
    req: ProfileUpdateRequest,
    current_user: dict = Depends(get_current_user),
    db: Database = Depends(get_db)
):
    user = get_user_by_id(db, current_user["id"])
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    update_fields = {"updated_at": datetime.now(timezone.utc)}

    if req.name and req.name.strip():
        update_fields["name"] = req.name.strip()

    if req.new_password:
        if not req.current_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is required to set a new password."
            )
        if not verify_password(req.current_password, user.get("password_hash", "")):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password verification failed."
            )
        update_fields["password_hash"] = hash_password(req.new_password)

    db.users.update_one({"_id": ObjectId(current_user["id"])}, {"$set": update_fields})
    updated_user = get_user_by_id(db, current_user["id"])
    updated_user["id"] = str(updated_user.pop("_id"))
    updated_user["total_scans"] = db.scans.count_documents({"user_id": ObjectId(current_user["id"])})
    return updated_user
