import json
import csv
import io
from typing import Dict, Any, List
from backend.models.db_models import SurveyDB, DetectionDB

def generate_json_report(survey: SurveyDB, detections: List[DetectionDB]) -> str:
    data = {
        "survey_id": survey.id,
        "name": survey.name,
        "date": survey.date,
        "sonar_type": survey.sonar_type,
        "status": survey.status,
        "total_detections": len(detections),
        "detections": [
            {
                "id": d.id,
                "class_name": d.class_name,
                "confidence": d.confidence,
                "bbox": d.bbox,
                "latitude": d.lat,
                "longitude": d.lon,
                "risk_score": d.risk_score,
                "risk_level": d.risk_level,
                "status": d.status,
                "created_at": d.created_at.isoformat() if d.created_at else None
            }
            for d in detections
        ]
    }
    return json.dumps(data, indent=2)


def generate_csv_report(survey: SurveyDB, detections: List[DetectionDB]) -> str:
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow([
        "Detection ID", "Survey Name", "Class Name", "Confidence",
        "Latitude", "Longitude", "Risk Score", "Risk Level", "Status"
    ])
    
    for d in detections:
        writer.writerow([
            d.id, survey.name, d.class_name, d.confidence,
            d.lat, d.lon, d.risk_score, d.risk_level, d.status
        ])
        
    return output.getvalue()


def generate_geojson_report(survey: SurveyDB, detections: List[DetectionDB]) -> str:
    features = []
    for d in detections:
        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [d.lon, d.lat] # GeoJSON uses [Lon, Lat] order
            },
            "properties": {
                "id": d.id,
                "survey_id": survey.id,
                "class_name": d.class_name,
                "confidence": d.confidence,
                "risk_score": d.risk_score,
                "risk_level": d.risk_level,
                "status": d.status,
                "bbox": d.bbox
            }
        })
        
    geojson_data = {
        "type": "FeatureCollection",
        "name": f"AquaGuard_Survey_{survey.id}",
        "crs": {
            "type": "name",
            "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}
        },
        "features": features
    }
    return json.dumps(geojson_data, indent=2)


def generate_kml_report(survey: SurveyDB, detections: List[DetectionDB]) -> str:
    placemarks = []
    for d in detections:
        placemarks.append(f"""
    <Placemark>
      <name>{d.class_name} ({d.risk_level})</name>
      <description>
        <![CDATA[
          <b>Survey:</b> {survey.name}<br/>
          <b>Confidence:</b> {d.confidence * 100:.1f}%<br/>
          <b>Risk Score:</b> {d.risk_score} ({d.risk_level})<br/>
          <b>Status:</b> {d.status}<br/>
          <b>Coordinates:</b> {d.lat}, {d.lon}
        ]]>
      </description>
      <Point>
        <coordinates>{d.lon},{d.lat},0</coordinates>
      </Point>
    </Placemark>""")

    kml_str = f"""<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>AquaGuard AI - Survey {survey.name}</name>
    <description>Side-Scan Sonar Hazard Geo-tagging Report</description>
    {''.join(placemarks)}
  </Document>
</kml>"""
    return kml_str


def generate_pdf_report(survey: SurveyDB, detections: List[DetectionDB]) -> bytes:
    """Generate professional PDF report using ReportLab."""
    buffer = io.BytesIO()
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib import colors
        
        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
        elements = []
        styles = getSampleStyleSheet()
        
        title_style = ParagraphStyle(
            'TitleStyle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=20,
            textColor=colors.HexColor('#0B1F33'),
            spaceAfter=8
        )
        
        subtitle_style = ParagraphStyle(
            'SubTitleStyle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=11,
            textColor=colors.HexColor('#0E7490'),
            spaceAfter=15
        )
        
        elements.append(Paragraph("AquaGuard AI - Marine Hazard Intelligence Report", title_style))
        elements.append(Paragraph(f"Survey Name: <b>{survey.name}</b> | Date: <b>{survey.date}</b> | Equipment: <b>{survey.sonar_type}</b>", subtitle_style))
        elements.append(Spacer(1, 10))
        
        # Summary metrics table
        critical_count = sum(1 for d in detections if d.risk_level == "Critical")
        high_count = sum(1 for d in detections if d.risk_level == "High")
        med_count = sum(1 for d in detections if d.risk_level == "Medium")
        low_count = sum(1 for d in detections if d.risk_level == "Low")
        
        summary_data = [
            ["Total Hazards Detected", "Critical Risk", "High Risk", "Medium Risk", "Low Risk"],
            [str(len(detections)), str(critical_count), str(high_count), str(med_count), str(low_count)]
        ]
        
        summary_table = Table(summary_data, colWidths=[100, 100, 100, 100, 100])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0B1F33')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0,0), (-1,0), 6),
            ('BACKGROUND', (0,1), (-1,1), colors.HexColor('#F5F8FA')),
            ('GRID', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
        ]))
        
        elements.append(summary_table)
        elements.append(Spacer(1, 15))
        
        elements.append(Paragraph("Detailed Geo-Tagged Detection Log", styles['Heading2']))
        elements.append(Spacer(1, 8))
        
        # Detections table
        table_data = [["Class", "Confidence", "Latitude", "Longitude", "Risk Level", "Status"]]
        for d in detections:
            table_data.append([
                d.class_name.replace("_", " ").title(),
                f"{d.confidence*100:.1f}%",
                f"{d.lat:.4f}",
                f"{d.lon:.4f}",
                d.risk_level,
                d.status.upper()
            ])
            
        det_table = Table(table_data, colWidths=[120, 75, 75, 75, 80, 70])
        det_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0E7490')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F8FAFC')])
        ]))
        
        elements.append(det_table)
        
        # Add Data Notes (Requirement 5)
        elements.append(Spacer(1, 15))
        data_notes_style = ParagraphStyle(
            'DataNotesStyle',
            parent=styles['Normal'],
            fontName='Helvetica-Oblique',
            fontSize=8,
            textColor=colors.HexColor('#475569'),
            leading=11
        )
        data_notes_text = (
            "<b>DRISHTI-SSS Data & Performance Notes:</b><br/>"
            "• <i>Ghost Net Synthetic Generation:</i> All ghost_net target examples are 100% synthetic acoustic generation.<br/>"
            "• <i>Upstream Datasets:</i> Tiles source from SubPipe/SubPipeMini2, AI4Shipwrecks, Roboflow SSS, and Kaggle MILCO (CC-BY-SA-4.0).<br/>"
            "• <i>Evaluation Scope:</i> Metrics derive from a held-out test split of the DRISHTI benchmark and may vary across new survey regions or different sonar hardware."
        )
        elements.append(Paragraph(data_notes_text, data_notes_style))

        doc.build(elements)
        buffer.seek(0)
        return buffer.getvalue()

    except Exception as e:
        # Fallback simple text-pdf
        return f"AquaGuard AI Report for {survey.name}\nTotal Detections: {len(detections)}\nError generating PDF layout: {e}".encode('utf-8')
