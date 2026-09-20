import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Text, JSON, Enum
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class SurveyDB(Base):
    __tablename__ = "surveys"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    date = Column(String(50), nullable=False)
    sonar_type = Column(String(100), nullable=False, default="Side-Scan Sonar (SSS)")
    image_path = Column(String(500), nullable=False)
    preprocessed_image_path = Column(String(500), nullable=True)
    status = Column(String(50), default="processed")  # processing, processed, verified
    start_lat = Column(Float, nullable=True)
    start_lon = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    detections = relationship("DetectionDB", back_populates="survey", cascade="all, delete-orphan")


class DetectionDB(Base):
    __tablename__ = "detections"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    survey_id = Column(String, ForeignKey("surveys.id"), nullable=False)
    class_name = Column(String(100), nullable=False)  # ghost_net_fishing_gear, shipwreck, debris_object, anomaly
    confidence = Column(Float, nullable=False)
    bbox = Column(JSON, nullable=False)  # [x, y, width, height] normalized (0.0 - 1.0)
    lat = Column(Float, nullable=False)
    lon = Column(Float, nullable=False)
    risk_score = Column(Float, nullable=False)
    risk_level = Column(String(20), nullable=False)  # Low, Medium, High, Critical
    status = Column(String(20), default="pending")  # pending, confirmed, rejected

    created_at = Column(DateTime, default=datetime.utcnow)

    survey = relationship("SurveyDB", back_populates="detections")
    verifications = relationship("VerificationDB", back_populates="detection", cascade="all, delete-orphan")


class VerificationDB(Base):
    __tablename__ = "verifications"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    detection_id = Column(String, ForeignKey("detections.id"), nullable=False)
    action = Column(String(50), nullable=False)  # confirmed, rejected, reclassified
    old_class = Column(String(100), nullable=True)
    new_class = Column(String(100), nullable=True)
    note = Column(Text, nullable=True)
    verified_by = Column(String(100), default="Marine Expert Verifier")
    created_at = Column(DateTime, default=datetime.utcnow)

    detection = relationship("DetectionDB", back_populates="verifications")
