"""
Authentication API Endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.database import Database

from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, UserResponse
from app.dependencies import get_db, get_current_user
from app.services.auth_service import (
    register_user,
    get_user_by_email,
    verify_password,
    create_access_token
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description="Registers a new user account with hashed password and returns an initial JWT session token."
)
def register(req: RegisterRequest, db: Database = Depends(get_db)):
    try:
        user = register_user(
            db=db,
            name=req.name,
            email=req.email,
            password=req.password
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

    token = create_access_token({"sub": user["id"], "email": user["email"], "role": user["role"]})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Authenticate user and obtain JWT token",
    description="Validates email and password credentials, returning a signed JWT bearer token upon success."
)
def login(req: LoginRequest, db: Database = Depends(get_db)):
    user = get_user_by_email(db, req.email)
    if not user or not verify_password(req.password, user.get("password_hash", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password combination."
        )

    user_id = str(user["_id"])
    token = create_access_token({"sub": user_id, "email": user["email"], "role": user.get("role", "user")})

    user_data = {
        "id": user_id,
        "name": user["name"],
        "email": user["email"],
        "role": user.get("role", "user"),
        "created_at": user.get("created_at")
    }

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user_data
    }


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current authenticated user profile",
    description="Returns the identity and role details for the actively authenticated user."
)
def get_me(current_user: dict = Depends(get_current_user), db: Database = Depends(get_db)):
    # Include scan count
    count = db.scans.count_documents({"user_id": current_user["id"]}) if "id" in current_user else 0
    current_user["total_scans"] = count
    return current_user


@router.post(
    "/logout",
    status_code=status.HTTP_200_OK,
    summary="Log out user",
    description="Explicitly logs out user and signals client session termination."
)
def logout(current_user: dict = Depends(get_current_user)):
    return {
        "success": True,
        "message": "User session logged out successfully."
    }
