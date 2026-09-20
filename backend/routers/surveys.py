import os
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from backend.database.session import get_db
from backend.models.db_models import SurveyDB, DetectionDB
from backend.models.schemas import SurveyResponse, SurveyCreate
from backend.services.preprocessing import preprocess_sonar_image
from backend.services.detector_service import get_detector

router = APIRouter(prefix="/surveys", tags=["Surveys"])

UPLOAD_DIR = os.path.join(os.getcwd(), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("", response_model=List[SurveyResponse])
def get_surveys(db: Session = Depends(get_db)):
    surveys = db.query(SurveyDB).order_by(SurveyDB.created_at.desc()).all()
    return surveys


@router.get("/{survey_id}", response_model=SurveyResponse)
def get_survey_by_id(survey_id: str, db: Session = Depends(get_db)):
    survey = db.query(SurveyDB).filter(SurveyDB.id == survey_id).first()
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    return survey


@router.post("", response_model=SurveyResponse)
async def create_survey(
    name: str = Form(...),
    date: str = Form(...),
    sonar_type: str = Form("Side-Scan Sonar (SSS)"),
    start_lat: Optional[float] = Form(18.9220),
    start_lon: Optional[float] = Form(72.8347),
    confidence_threshold: Optional[float] = Form(0.50),
    already_preprocessed: Optional[bool] = Form(False),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    survey_id = str(uuid.uuid4())
    
    # Save raw uploaded image
    file_ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    raw_filename = f"{survey_id}_raw.{file_ext}"
    raw_path = os.path.join(UPLOAD_DIR, raw_filename)
    
    image_bytes = await file.read()
    with open(raw_path, "wb") as f:
        f.write(image_bytes)
        
    # Preprocess sonar image with OpenCV CLAHE & Denoising (skips if already_preprocessed=True)
    preprocessed_bytes = preprocess_sonar_image(image_bytes, already_preprocessed=already_preprocessed or False)
    prep_filename = f"{survey_id}_prep.jpg"
    prep_path = os.path.join(UPLOAD_DIR, prep_filename)
    with open(prep_path, "wb") as f:
        f.write(preprocessed_bytes)

        
    # Web accessible relative paths
    raw_url = f"/uploads/{raw_filename}"
    prep_url = f"/uploads/{prep_filename}"
    
    # Save survey to database
    db_survey = SurveyDB(
        id=survey_id,
        name=name,
        date=date,
        sonar_type=sonar_type,
        image_path=raw_url,
        preprocessed_image_path=prep_url,
        status="processed",
        start_lat=start_lat,
        start_lon=start_lon
    )
    db.add(db_survey)
    db.commit()
    db.refresh(db_survey)
    
    # Execute AI Detections using DetectorService (Mock or YOLOv11)
    detector = get_detector()
    detected_items = detector.detect(
        image_bytes=image_bytes,
        confidence_threshold=confidence_threshold,
        start_lat=start_lat or 18.9220,
        start_lon=start_lon or 72.8347
    )
    
    for item in detected_items:
        db_detection = DetectionDB(
            survey_id=survey_id,
            class_name=item["class_name"],
            confidence=item["confidence"],
            bbox=item["bbox"],
            lat=item["lat"],
            lon=item["lon"],
            risk_score=item["risk_score"],
            risk_level=item["risk_level"],
            status="pending"
        )
        db.add(db_detection)
        
    db.commit()
    db.refresh(db_survey)
    
    return db_survey
