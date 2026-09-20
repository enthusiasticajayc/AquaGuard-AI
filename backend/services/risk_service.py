from backend.config import settings

def calculate_risk(class_name: str, confidence: float, bbox: list) -> tuple[float, str]:
    """
    Risk Score Formula:
    risk_score = (confidence * 0.40) + (class_severity * 0.45) + (bbox_area_factor * 0.15)
    
    Returns:
        (risk_score: float, risk_level: str)
    """
    severity = settings.CLASS_SEVERITY_WEIGHTS.get(class_name.lower(), 0.50)
    
    # Calculate relative bbox area [x, y, w, h]
    w = bbox[2] if len(bbox) > 2 else 0.1
    h = bbox[3] if len(bbox) > 3 else 0.1
    area = w * h
    bbox_factor = min(1.0, area * 8.0) # normalize size impact
    
    raw_score = (confidence * 0.40) + (severity * 0.45) + (bbox_factor * 0.15)
    risk_score = round(max(0.0, min(1.0, raw_score)), 3)
    
    if risk_score >= 0.75:
        level = "Critical"
    elif risk_score >= 0.60:
        level = "High"
    elif risk_score >= 0.40:
        level = "Medium"
    else:
        level = "Low"
        
    return risk_score, level
