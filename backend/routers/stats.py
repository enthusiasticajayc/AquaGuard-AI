from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database.session import get_db
from backend.models.db_models import SurveyDB, DetectionDB
from backend.models.schemas import StatsResponse
from backend.services.detector_service import get_detector
from backend.config import settings

router = APIRouter(prefix="/stats", tags=["Stats"])

@router.get("", response_model=StatsResponse)
def get_stats(db: Session = Depends(get_db)):
    surveys_count = db.query(SurveyDB).count()
    total_detections = db.query(DetectionDB).count()
    pending_count = db.query(DetectionDB).filter(DetectionDB.status == "pending").count()
    high_risk_count = db.query(DetectionDB).filter(DetectionDB.risk_level.in_(["High", "Critical"])).count()
    
    # Class breakdowns
    detections = db.query(DetectionDB).all()
    class_counts = {
        "ghost_net_fishing_gear": 0,
        "shipwreck": 0,
        "debris_object": 0,
        "anomaly": 0
    }
    risk_counts = {
        "Critical": 0,
        "High": 0,
        "Medium": 0,
        "Low": 0
    }
    
    for d in detections:
        c_name = d.class_name if d.class_name in class_counts else "anomaly"
        class_counts[c_name] = class_counts.get(c_name, 0) + 1
        
        r_level = d.risk_level if d.risk_level in risk_counts else "Medium"
        risk_counts[r_level] = risk_counts.get(r_level, 0) + 1

    detector = get_detector()

    return StatsResponse(
        surveys_processed=surveys_count,
        total_detections=total_detections,
        pending_verifications=pending_count,
        high_risk_hazards=high_risk_count,
        detector_mode=settings.DETECTOR_MODE,
        is_mock=detector.is_mock,
        class_counts=class_counts,
        risk_counts=risk_counts
    )
