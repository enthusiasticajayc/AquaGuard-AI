from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response, PlainTextResponse, JSONResponse
from sqlalchemy.orm import Session
from backend.database.session import get_db
from backend.models.db_models import SurveyDB, DetectionDB
from backend.services.report_service import (
    generate_json_report,
    generate_csv_report,
    generate_geojson_report,
    generate_kml_report,
    generate_pdf_report
)

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/{survey_id}")
def get_survey_report(
    survey_id: str,
    format: str = Query("json", pattern="^(json|csv|pdf|geojson|kml)$"),
    db: Session = Depends(get_db)
):
    survey = db.query(SurveyDB).filter(SurveyDB.id == survey_id).first()
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
        
    detections = db.query(DetectionDB).filter(DetectionDB.survey_id == survey_id).all()
    
    fmt = format.lower()
    
    if fmt == "json":
        content = generate_json_report(survey, detections)
        return Response(content=content, media_type="application/json")
    elif fmt == "csv":
        content = generate_csv_report(survey, detections)
        headers = {"Content-Disposition": f'attachment; filename="aquaguard_{survey_id}.csv"'}
        return Response(content=content, media_type="text/csv", headers=headers)
    elif fmt == "geojson":
        content = generate_geojson_report(survey, detections)
        headers = {"Content-Disposition": f'attachment; filename="aquaguard_{survey_id}.geojson"'}
        return Response(content=content, media_type="application/geo+json", headers=headers)
    elif fmt == "kml":
        content = generate_kml_report(survey, detections)
        headers = {"Content-Disposition": f'attachment; filename="aquaguard_{survey_id}.kml"'}
        return Response(content=content, media_type="application/vnd.google-earth.kml+xml", headers=headers)
    elif fmt == "pdf":
        pdf_bytes = generate_pdf_report(survey, detections)
        headers = {"Content-Disposition": f'attachment; filename="aquaguard_{survey_id}.pdf"'}
        return Response(content=pdf_bytes, media_type="application/pdf", headers=headers)
    else:
        raise HTTPException(status_code=400, detail="Unsupported report format")
