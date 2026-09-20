import os

class Settings:
    PROJECT_NAME: str = "AquaGuard AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Environment mode: auto | yolo | mock
    DETECTOR_MODE: str = os.getenv("DETECTOR_MODE", "auto")
    YOLO_MODEL_PATH: str = os.getenv("YOLO_MODEL_PATH", "backend/models/best.pt")
    
    # Database URL
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./aquaguard.db")
    
    # DRISHTI-SSS & Legacy Class Severity Weights
    CLASS_SEVERITY_WEIGHTS: dict = {
        "mine_cylinder": 1.00,        # Critical explosive / naval mine hazard
        "ghost_net": 0.95,            # High ecological & entanglement severity
        "ghost_net_fishing_gear": 0.95,
        "submarine_pipeline": 0.85,   # Critical underwater infrastructure
        "shipwreck": 0.80,            # Navigation hazard / vessel obstruction
        "crab_pot": 0.50,             # Commercial trap debris
        "debris_object": 0.50,        # General seabed debris
        "anomaly": 0.40,              # Geological / acoustic anomaly
        "default": 0.50
    }
    
    DEFAULT_CONFIDENCE_THRESHOLD: float = 0.50


settings = Settings()
