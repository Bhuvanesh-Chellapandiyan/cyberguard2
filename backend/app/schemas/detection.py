"""
Detection and Dashboard Schemas.
"""

from datetime import datetime
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field, field_validator


class DetectRequest(BaseModel):
    url: str = Field(..., min_length=3, max_length=2048, description="Target URL to inspect")

    @field_validator("url")
    @classmethod
    def validate_url(cls, v: str) -> str:
        cleaned = v.strip()
        if not cleaned:
            raise ValueError("URL cannot be empty")
        # Must look like a domain, IP, or standard URL
        if " " in cleaned:
            raise ValueError("URL cannot contain whitespace")
        if "." not in cleaned and not any(clean in cleaned for clean in ["localhost", "127.0.0.1"]):
            raise ValueError("Invalid URL format: missing valid domain name or IP address")
        return cleaned


class DetectResult(BaseModel):
    id: Optional[str] = None
    url: str
    prediction: str  # "LEGITIMATE" or "PHISHING"
    confidence: float  # e.g. 96.50
    risk_level: str  # "LOW", "MEDIUM", "HIGH"
    features: Dict[str, Any]
    reasons: List[str]
    created_at: Optional[datetime] = None


class DetectionHistoryItem(BaseModel):
    id: str
    url: str
    prediction: str
    confidence: float
    risk_level: str
    reasons: List[str]
    created_at: datetime


class DetectionListResponse(BaseModel):
    scans: List[DetectionHistoryItem]
    total: int
    page: int
    limit: int


class DashboardStats(BaseModel):
    total_scans: int
    phishing_count: int
    legitimate_count: int
    average_confidence: float
    risk_distribution: Dict[str, int]
    timeline: List[Dict[str, Any]]
    recent_scans: List[DetectionHistoryItem]
