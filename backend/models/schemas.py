from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field

# --- Verification Schemas ---
class VerificationBase(BaseModel):
    action: str  # confirmed, rejected, reclassified
    note: Optional[str] = None
    new_class: Optional[str] = None

class VerificationCreate(VerificationBase):
    pass

class VerificationResponse(VerificationBase):
    id: str
    detection_id: str
    old_class: Optional[str] = None
    verified_by: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- Detection Schemas ---
class DetectionBase(BaseModel):
    class_name: str
    confidence: float
    bbox: List[float]  # [x, y, w, h] normalized 0-1
    lat: float
    lon: float
    risk_score: float
    risk_level: str
    status: str = "pending"

class DetectionCreate(DetectionBase):
    survey_id: str

class DetectionUpdateVerify(BaseModel):
    action: str  # confirm | reject | reclassify
    new_class: Optional[str] = None
    note: Optional[str] = None

class DetectionResponse(DetectionBase):
    id: str
    survey_id: str
    created_at: datetime
    verifications: List[VerificationResponse] = []

    class Config:
        from_attributes = True

# --- Survey Schemas ---
class SurveyCreate(BaseModel):
    name: str
    date: str
    sonar_type: str = "Side-Scan Sonar (SSS)"
    start_lat: Optional[float] = 18.9220  # Sample default off Mumbai coast
    start_lon: Optional[float] = 72.8347
    confidence_threshold: Optional[float] = 0.50

class SurveyResponse(BaseModel):
    id: str
    name: str
    date: str
    sonar_type: str
    image_path: str
    preprocessed_image_path: Optional[str] = None
    status: str
    start_lat: Optional[float] = None
    start_lon: Optional[float] = None
    created_at: datetime
    detections: List[DetectionResponse] = []

    class Config:
        from_attributes = True

# --- Stats Schema ---
class StatsResponse(BaseModel):
    surveys_processed: int
    total_detections: int
    pending_verifications: int
    high_risk_hazards: int
    detector_mode: str
    is_mock: bool
    class_counts: dict
    risk_counts: dict
