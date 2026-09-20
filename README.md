# AquaGuard AI 🌊

> **Autonomous Side-Scan Sonar (SSS) Underwater Debris & Hazard Geo-Tagging Intelligence Platform**  
> **Smart India Hackathon 2026** | **Problem Statement #26057** (Theme: Disaster Management) | **Team:** Tech Galacticos  
> **Tagline:** *"Detect → Locate → Verify → Protect."*

---

## 📌 Executive Overview

**AquaGuard AI** processes Side-Scan Sonar (SSS) imagery using **YOLOv11** deep learning and **OpenCV CLAHE** acoustic preprocessing to detect submerged ghost fishing nets, shipwrecks, metal debris, and seabed anomalies. Every detection is geo-tagged in **WGS84 (SRID 4326)** coordinates onto an interactive GIS Leaflet control room, routed to domain experts for human-in-the-loop verification, and exported in structured reporting formats (**PDF, GeoJSON, KML, CSV, JSON**).

---

## 🔄 End-to-End Pipeline Architecture

```
Sonar Upload ──► OpenCV Preprocessing ──► YOLOv11 AI Detection ──► Confidence Filtering ──► GIS Geo-Tagging ──► Human Verification ──► Multi-Format Report
```

1. **Sonar Upload**: Accepts high-resolution Side-Scan Sonar (SSS) waterfall imagery (.png, .jpg, .tiff).
2. **Preprocessing**: OpenCV CLAHE (Contrast Limited Adaptive Histogram Equalization) + Fast Non-Local Means Denoising.
3. **AI Detection**: YOLOv11 neural network inference behind a unified `DetectorService`.
4. **Confidence Filtering**: Adjustable UI confidence slider (default threshold `0.50`).
5. **Geo-Tagging**: WGS84 SRID 4326 coordinate projection relative to survey starting position.
6. **GIS Visualization**: Interactive Leaflet map with custom risk markers (Critical/High/Medium/Low) and heatmaps.
7. **Human Verification**: Prioritized expert review queue supporting keyboard hotkeys (`C` for Confirm, `R` for Reject).
8. **Actionable Reporting**: 5 export formats (PDF, GeoJSON, KML, CSV, JSON) for marine cleanup authorities.

---

## 🛠 Tech Stack

- **Frontend**: React (Vite), React Router v6, Tailwind CSS v4, react-leaflet, Recharts, Lucide-react, jsPDF.
- **Backend**: FastAPI, Uvicorn, Pydantic v2, SQLAlchemy 2.0, GeoAlchemy2, ReportLab.
- **Database**: PostgreSQL 15 + PostGIS 3 (with automatic SQLite embedded fallback for local dev).
- **AI & Computer Vision**: Ultralytics YOLOv11, OpenCV (`opencv-python-headless`), NumPy, Pandas.
- **DevOps**: Docker Compose, Dockerfiles.

---

## 🤖 AI Detector Integration (`DETECTOR_MODE`)

Inference is encapsulated behind a unified `DetectorService` interface with two implementations:
- `YoloDetector`: Loads PyTorch weights from `backend/models_weights/best.pt`.
- `MockDetector`: Generates deterministic, high-fidelity realistic sonar debris detections off the Indian coast.

### Mode Configuration (`DETECTOR_MODE` env variable):
- `auto` (Default): Uses `YoloDetector` if `best.pt` exists; otherwise falls back gracefully to `MockDetector`.
- `yolo`: Enforces YOLOv11 PyTorch weights.
- `mock`: Operates in demo mode. The UI displays a **"Demo Data (Mock Detector)"** badge for full transparency.

---

## 📐 Risk Calculation Formula

$$\text{Risk Score} = (\text{Confidence} \times 0.40) + (\text{Class Severity} \times 0.45) + (\text{Relative Area} \times 0.15)$$

- **Class Severity Weights**: Ghost Net Fishing Gear (`0.90`), Submerged Shipwreck (`0.75`), Debris Object (`0.50`), Anomaly (`0.40`).
- **Risk Severity Levels**:
  - 🔴 **Critical**: $\ge 0.75$
  - 🟠 **High**: $\ge 0.60$
  - 🟡 **Medium**: $\ge 0.40$
  - 🟢 **Low**: $< 0.40$

---

## 🚀 Quick Start & Installation

### Option 1: One-Command Docker Compose (Recommended)

```bash
docker compose up --build
```
- **Frontend App**: `http://localhost:3000`
- **Backend API & OpenAPI Docs**: `http://localhost:8000/docs`

---

### Option 2: Standalone Local Development Mode

#### 1. Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn backend.main:app --reload --port 8000
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## ⏱ 60-Second Demo Flow

1. Open `http://localhost:5173` → Click **"Launch Control Console"**.
2. Go to **Analyze Sonar** (`/analyze`) → Select a sonar image → Click **"Process Sonar Imagery"**.
3. Watch the live 4-step stepper complete → View bounding box overlays on **Detection Viewer** (`/surveys/:id`).
4. Click **GIS Control Map** (`/map`) → Filter by `Critical` risk → Click marker popup → Click **"Confirm"**.
5. Go to **Verification Queue** (`/verify`) → Press keyboard shortcut `C` to confirm pending items.
6. Open **Export Reports** (`/reports`) → Download **GeoJSON**, **KML**, and **PDF Document**.

---

## 👥 Team Tech Galacticos
Built for **Smart India Hackathon 2026** (Problem Statement #26057).
