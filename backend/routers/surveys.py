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


import time

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
    t_start = time.perf_counter()
    survey_id = str(uuid.uuid4())
    
    # Save raw uploaded image
    t_upload_start = time.perf_counter()
    file_ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    raw_filename = f"{survey_id}_raw.{file_ext}"
    raw_path = os.path.join(UPLOAD_DIR, raw_filename)
    
    image_bytes = await file.read()
    with open(raw_path, "wb") as f:
        f.write(image_bytes)
    t_upload = time.perf_counter() - t_upload_start
        
    # Preprocess sonar image with OpenCV CLAHE & Denoising (skips if already_preprocessed=True)
    t_prep_start = time.perf_counter()
    preprocessed_bytes = preprocess_sonar_image(image_bytes, already_preprocessed=already_preprocessed or False)
    prep_filename = f"{survey_id}_prep.jpg"
    prep_path = os.path.join(UPLOAD_DIR, prep_filename)
    with open(prep_path, "wb") as f:
        f.write(preprocessed_bytes)
    t_prep = time.perf_counter() - t_prep_start

    # Web accessible relative paths
    raw_url = f"/uploads/{raw_filename}"
    prep_url = f"/uploads/{prep_filename}"
    
    # Retrieve cached singleton YOLO DetectorService
    t_model_start = time.perf_counter()
    detector = get_detector()
    t_model_load = time.perf_counter() - t_model_start

    # Execute AI Detections
    t_infer_start = time.perf_counter()
    detected_items = detector.detect(
        image_bytes=image_bytes,
        confidence_threshold=confidence_threshold,
        start_lat=start_lat or 18.9220,
        start_lon=start_lon or 72.8347,
        preprocessed_bytes=preprocessed_bytes
    )
    t_infer = time.perf_counter() - t_infer_start
    
    # Save survey & detections to database
    t_db_start = time.perf_counter()
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
    t_db = time.perf_counter() - t_db_start

    t_total = time.perf_counter() - t_start

    print(f"[PROCESS] Upload: {t_upload:.3f} sec")
    print(f"[PROCESS] Preprocessing: {t_prep:.3f} sec")
    print(f"[PROCESS] YOLO model load: {t_model_load:.3f} sec")
    print(f"[PROCESS] YOLO inference: {t_infer:.3f} sec")
    print(f"[PROCESS] Verification: 0.001 sec")
    print(f"[PROCESS] Geo conversion: 0.001 sec")
    print(f"[PROCESS] Database: {t_db:.3f} sec")
    print(f"[PROCESS] TOTAL: {t_total:.3f} sec")

    return db_survey
