import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from backend.config import settings
from backend.database.session import init_db, SessionLocal
from backend.database.seed import seed_database
from backend.models.db_models import SurveyDB
from backend.routers import surveys, detections, reports, stats, research

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AquaGuard AI Backend - Side-Scan Sonar Debris Detection, Geo-Tagging, Verification & Reporting API",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static uploads directory for serving sonar imagery
UPLOAD_DIR = os.path.join(os.getcwd(), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(surveys.router, prefix=settings.API_V1_STR)
app.include_router(detections.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)
app.include_router(stats.router, prefix=settings.API_V1_STR)
app.include_router(research.router, prefix=settings.API_V1_STR)

@app.on_event("startup")
def startup_event():
    init_db()
    # Check if DB needs seeding
    db = SessionLocal()
    try:
        count = db.query(SurveyDB).count()
        if count == 0:
            print("[Main] Empty database detected. Seeding sample surveys...")
            seed_database()
    except Exception as e:
        print(f"[Main] Startup DB check warning: {e}")
    finally:
        db.close()

@app.get("/")
def root():
    return {
        "title": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs": "/docs",
        "detector_mode": settings.DETECTOR_MODE
    }
