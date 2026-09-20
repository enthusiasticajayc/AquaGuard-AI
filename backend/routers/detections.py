from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.database.session import get_db
from backend.models.db_models import DetectionDB, VerificationDB
from backend.models.schemas import DetectionResponse, DetectionUpdateVerify, VerificationResponse

router = APIRouter(prefix="/detections", tags=["Detections"])

@router.get("", response_model=List[DetectionResponse])
def get_detections(
    survey_id: Optional[str] = None,
    class_name: Optional[str] = None,
    risk_level: Optional[str] = None,
    status: Optional[str] = None,
    min_confidence: Optional[float] = Query(0.0, ge=0.0, le=1.0),
    db: Session = Depends(get_db)
):
    query = db.query(DetectionDB)
    
    if survey_id:
        query = query.filter(DetectionDB.survey_id == survey_id)
    if class_name and class_name != "all":
        query = query.filter(DetectionDB.class_name == class_name)
    if risk_level and risk_level != "all":
        query = query.filter(DetectionDB.risk_level == risk_level)
    if status and status != "all":
        query = query.filter(DetectionDB.status == status)
    if min_confidence > 0:
        query = query.filter(DetectionDB.confidence >= min_confidence)
        
    detections = query.order_by(DetectionDB.risk_score.desc()).all()
    return detections


@router.patch("/{detection_id}/verify", response_model=DetectionResponse)
def verify_detection(
    detection_id: str,
    payload: DetectionUpdateVerify,
    db: Session = Depends(get_db)
):
    detection = db.query(DetectionDB).filter(DetectionDB.id == detection_id).first()
    if not detection:
        raise HTTPException(status_code=404, detail="Detection not found")
        
    action = payload.action.lower()
    old_class = detection.class_name
    
    if action == "confirm" or action == "confirmed":
        detection.status = "confirmed"
    elif action == "reject" or action == "rejected":
        detection.status = "rejected"
    elif action == "reclassify":
        if payload.new_class:
            detection.class_name = payload.new_class
            detection.status = "confirmed"
    else:
        raise HTTPException(status_code=400, detail="Invalid action. Must be confirm, reject, or reclassify.")
        
    # Log verification audit entry
    verification_log = VerificationDB(
        detection_id=detection_id,
        action=action,
        old_class=old_class,
        new_class=payload.new_class or detection.class_name,
        note=payload.note,
        verified_by="Marine Expert Verifier"
    )
    db.add(verification_log)
    db.commit()
    db.refresh(detection)
    
    return detection
