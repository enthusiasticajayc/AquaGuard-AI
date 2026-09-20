import os
import uuid
from datetime import datetime, timedelta
import cv2
import numpy as np
from backend.database.session import SessionLocal, init_db
from backend.models.db_models import SurveyDB, DetectionDB, VerificationDB
from backend.services.risk_service import calculate_risk
from backend.services.preprocessing import preprocess_sonar_image

def generate_synthetic_sonar_image(filename: str, title: str):
    """Generate realistic side-scan sonar waterfall pattern image using OpenCV."""
    h, w = 600, 800
    # Background seabed texture
    np.random.seed(abs(hash(title)) % 1000)
    base = np.random.normal(60, 15, (h, w)).astype(np.uint8)
    
    # Add central acoustic nadir line (dark gap in center of side-scan waterfall)
    nadir_width = 30
    center = w // 2
    base[:, center - nadir_width : center + nadir_width] = np.random.normal(15, 5, (h, nadir_width * 2)).astype(np.uint8)
    
    # Acoustic waterfall scanlines
    for y in range(0, h, 4):
        stripe = np.random.randint(-10, 10)
        base[y:y+2, :] = np.clip(base[y:y+2, :].astype(int) + stripe, 0, 255).astype(np.uint8)
        
    # Draw simulated acoustic shadow & high-reflectivity target highlights
    cv2.rectangle(base, (180, 180), (320, 260), (220), -1) # bright highlight
    cv2.rectangle(base, (320, 180), (410, 260), (20), -1)  # acoustic shadow
    
    cv2.rectangle(base, (520, 120), (700, 230), (240), -1) # shipwreck highlight
    cv2.rectangle(base, (700, 120), (760, 230), (10), -1)  # shadow
    
    # Convert to copper/amber ocean sonar colormap
    sonar_colored = cv2.applyColorMap(base, cv2.COLORMAP_OCEAN)
    
    # Save raw
    os.makedirs("uploads", exist_ok=True)
    raw_path = os.path.join("uploads", filename)
    cv2.imwrite(raw_path, sonar_colored)
    
    # Save preprocessed version
    success, img_bytes = cv2.imencode('.jpg', sonar_colored)
    prep_bytes = preprocess_sonar_image(img_bytes.tobytes())
    
    prep_filename = filename.replace("_raw.jpg", "_prep.jpg")
    prep_path = os.path.join("uploads", prep_filename)
    with open(prep_path, "wb") as f:
        f.write(prep_bytes)
        
    # Also save to public/samples for frontend assets
    pub_dir = os.path.join("..", "frontend", "public", "samples")
    os.makedirs(pub_dir, exist_ok=True)
    cv2.imwrite(os.path.join(pub_dir, filename), sonar_colored)

def seed_database():
    init_db()
    db = SessionLocal()
    
    # Clear existing data if present
    db.query(VerificationDB).delete()
    db.query(DetectionDB).delete()
    db.query(SurveyDB).delete()
    db.commit()
    
    # Generate sample images
    generate_synthetic_sonar_image("sample_mumbai_raw.jpg", "Mumbai Offshore Survey")
    generate_synthetic_sonar_image("sample_vizag_raw.jpg", "Visakhapatnam Deepwater Channel")
    generate_synthetic_sonar_image("sample_gulf_raw.jpg", "Gulf of Mannar Ecological Audit")
    
    # Survey 1: Mumbai Coast
    s1_id = "surv-mumbai-001"
    s1 = SurveyDB(
        id=s1_id,
        name="Mumbai Offshore Marine Debris Survey ( Arabian Sea )",
        date="2026-03-12",
        sonar_type="EdgeTech 4200 Dual-Frequency SSS",
        image_path="/uploads/sample_mumbai_raw.jpg",
        preprocessed_image_path="/uploads/sample_mumbai_prep.jpg",
        status="processed",
        start_lat=18.9220,
        start_lon=72.8347
    )
    
    # Survey 2: Visakhapatnam Channel
    s2_id = "surv-vizag-002"
    s2 = SurveyDB(
        id=s2_id,
        name="Visakhapatnam Deepwater Navigation Hazards ( Bay of Bengal )",
        date="2026-03-15",
        sonar_type="Klein 4900 Multi-Beam Sonar",
        image_path="/uploads/sample_vizag_raw.jpg",
        preprocessed_image_path="/uploads/sample_vizag_prep.jpg",
        status="processed",
        start_lat=17.6868,
        start_lon=83.2185
    )
    
    # Survey 3: Gulf of Mannar
    s3_id = "surv-gulf-003"
    s3 = SurveyDB(
        id=s3_id,
        name="Gulf of Mannar Ghost Net & Coral Protection Zone",
        date="2026-03-18",
        sonar_type="DeepVision Side-Scan Sonar 680kHz",
        image_path="/uploads/sample_gulf_raw.jpg",
        preprocessed_image_path="/uploads/sample_gulf_prep.jpg",
        status="processed",
        start_lat=9.2876,
        start_lon=79.3129
    )
    
    db.add_all([s1, s2, s3])
    db.commit()
    
    # Detections definition (~25 sample items across Indian waters)
    preset_detections = [
        # Mumbai Survey Detections (9 items)
        {"survey_id": s1_id, "cls": "ghost_net_fishing_gear", "conf": 0.92, "bbox": [0.225, 0.300, 0.18, 0.14], "dlat": 0.0021, "dlon": -0.0031, "st": "pending"},
        {"survey_id": s1_id, "cls": "shipwreck", "conf": 0.96, "bbox": [0.650, 0.220, 0.24, 0.20], "dlat": -0.0042, "dlon": 0.0051, "st": "confirmed"},
        {"survey_id": s1_id, "cls": "debris_object", "conf": 0.78, "bbox": [0.420, 0.680, 0.12, 0.10], "dlat": 0.0051, "dlon": 0.0022, "st": "pending"},
        {"survey_id": s1_id, "cls": "ghost_net_fishing_gear", "conf": 0.87, "bbox": [0.780, 0.580, 0.16, 0.12], "dlat": 0.0033, "dlon": 0.0061, "st": "pending"},
        {"survey_id": s1_id, "cls": "anomaly", "conf": 0.61, "bbox": [0.150, 0.780, 0.10, 0.09], "dlat": -0.0018, "dlon": -0.0042, "st": "rejected"},
        {"survey_id": s1_id, "cls": "debris_object", "conf": 0.74, "bbox": [0.350, 0.450, 0.11, 0.09], "dlat": 0.0012, "dlon": -0.0019, "st": "pending"},
        {"survey_id": s1_id, "cls": "shipwreck", "conf": 0.89, "bbox": [0.550, 0.820, 0.20, 0.15], "dlat": -0.0061, "dlon": 0.0018, "st": "confirmed"},
        {"survey_id": s1_id, "cls": "ghost_net_fishing_gear", "conf": 0.83, "bbox": [0.820, 0.150, 0.15, 0.13], "dlat": 0.0045, "dlon": -0.0055, "st": "pending"},
        {"survey_id": s1_id, "cls": "anomaly", "conf": 0.53, "bbox": [0.480, 0.250, 0.09, 0.08], "dlat": -0.0025, "dlon": 0.0034, "st": "pending"},

        # Vizag Channel Detections (8 items)
        {"survey_id": s2_id, "cls": "shipwreck", "conf": 0.98, "bbox": [0.300, 0.250, 0.28, 0.22], "dlat": 0.0015, "dlon": 0.0032, "st": "confirmed"},
        {"survey_id": s2_id, "cls": "debris_object", "conf": 0.82, "bbox": [0.680, 0.420, 0.14, 0.11], "dlat": -0.0028, "dlon": -0.0041, "st": "pending"},
        {"survey_id": s2_id, "cls": "ghost_net_fishing_gear", "conf": 0.89, "bbox": [0.180, 0.620, 0.17, 0.13], "dlat": 0.0048, "dlon": -0.0019, "st": "pending"},
        {"survey_id": s2_id, "cls": "debris_object", "conf": 0.75, "bbox": [0.500, 0.750, 0.12, 0.10], "dlat": -0.0039, "dlon": 0.0028, "st": "confirmed"},
        {"survey_id": s2_id, "cls": "anomaly", "conf": 0.58, "bbox": [0.820, 0.310, 0.08, 0.07], "dlat": 0.0062, "dlon": 0.0051, "st": "pending"},
        {"survey_id": s2_id, "cls": "ghost_net_fishing_gear", "conf": 0.91, "bbox": [0.420, 0.180, 0.19, 0.15], "dlat": -0.0019, "dlon": -0.0025, "st": "pending"},
        {"survey_id": s2_id, "cls": "debris_object", "conf": 0.69, "bbox": [0.250, 0.850, 0.10, 0.08], "dlat": 0.0031, "dlon": 0.0064, "st": "pending"},
        {"survey_id": s2_id, "cls": "anomaly", "conf": 0.64, "bbox": [0.750, 0.790, 0.09, 0.08], "dlat": -0.0055, "dlon": -0.0033, "st": "rejected"},

        # Gulf of Mannar Detections (8 items)
        {"survey_id": s3_id, "cls": "ghost_net_fishing_gear", "conf": 0.95, "bbox": [0.280, 0.340, 0.22, 0.16], "dlat": 0.0012, "dlon": -0.0028, "st": "pending"},
        {"survey_id": s3_id, "cls": "ghost_net_fishing_gear", "conf": 0.88, "bbox": [0.580, 0.210, 0.18, 0.14], "dlat": -0.0031, "dlon": 0.0042, "st": "confirmed"},
        {"survey_id": s3_id, "cls": "debris_object", "conf": 0.80, "bbox": [0.380, 0.650, 0.13, 0.11], "dlat": 0.0044, "dlon": 0.0018, "st": "pending"},
        {"survey_id": s3_id, "cls": "shipwreck", "conf": 0.91, "bbox": [0.720, 0.520, 0.21, 0.17], "dlat": -0.0049, "dlon": -0.0036, "st": "pending"},
        {"survey_id": s3_id, "cls": "ghost_net_fishing_gear", "conf": 0.84, "bbox": [0.150, 0.720, 0.15, 0.12], "dlat": 0.0028, "dlon": 0.0059, "st": "pending"},
        {"survey_id": s3_id, "cls": "debris_object", "conf": 0.73, "bbox": [0.850, 0.290, 0.11, 0.09], "dlat": -0.0022, "dlon": -0.0017, "st": "pending"},
        {"survey_id": s3_id, "cls": "anomaly", "conf": 0.66, "bbox": [0.490, 0.810, 0.09, 0.08], "dlat": 0.0058, "dlon": -0.0044, "st": "pending"},
        {"survey_id": s3_id, "cls": "ghost_net_fishing_gear", "conf": 0.79, "bbox": [0.630, 0.740, 0.14, 0.11], "dlat": -0.0016, "dlon": 0.0031, "st": "pending"},
    ]
    
    surveys_map = {s1_id: s1, s2_id: s2, s3_id: s3}
    
    for idx, item in enumerate(preset_detections):
        s_obj = surveys_map[item["survey_id"]]
        lat = round(s_obj.start_lat + item["dlat"], 6)
        lon = round(s_obj.start_lon + item["dlon"], 6)
        
        risk_score, risk_level = calculate_risk(item["cls"], item["conf"], item["bbox"])
        
        det_id = f"det-seed-{idx+1:03d}"
        det = DetectionDB(
            id=det_id,
            survey_id=item["survey_id"],
            class_name=item["cls"],
            confidence=item["conf"],
            bbox=item["bbox"],
            lat=lat,
            lon=lon,
            risk_score=risk_score,
            risk_level=risk_level,
            status=item["st"]
        )
        db.add(det)
        
        # Add a verification entry for confirmed/rejected ones
        if item["st"] in ["confirmed", "rejected"]:
            v = VerificationDB(
                detection_id=det_id,
                action=item["st"],
                old_class=item["cls"],
                new_class=item["cls"],
                note="Verified during initial marine survey scan audit",
                verified_by="Senior Hydrographer"
            )
            db.add(v)
            
    db.commit()
    db.close()
    print(f"[Seed] Successfully seeded 3 surveys and 25 sample detections across Indian waters.")

if __name__ == "__main__":
    seed_database()
