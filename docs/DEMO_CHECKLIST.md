# AquaGuard AI - Pre-Presentation End-to-End Demo Checklist

Use this checklist to perform the official 8-step verification flow of AquaGuard AI prior to hackathon evaluations and live team presentations.

---

## 📋 8-Step Official Demonstration Flow

### Step 1: Landing Page to Operations Control Dashboard
- [ ] Open `http://localhost:5173/` in Google Chrome / Edge.
- [ ] Click the **"Launch Control Console"** primary hero CTA button.
- [ ] Verify instant navigation to `/dashboard`.
- [ ] Confirm KPI cards display real telemetry:
  - **Surveys Processed** > 0
  - **Total Detections** > 0
  - **Pending Verification** > 0
  - **High-Risk Hazards** > 0

### Step 2: Sonar Image Intake & AI Pipeline Execution
- [ ] Navigate to `/analyze` (or click **"Launch Scan"** in top header).
- [ ] Upload or select a Side-Scan Sonar (SSS) image file.
- [ ] Click **"Process Sonar Imagery"**.
- [ ] Watch the 4-stage live pipeline stepper:
  1. **Preprocessing** (OpenCV CLAHE contrast enhancement)
  2. **AI Detection** (YOLOv11 neural network inference)
  3. **Confidence Filtering** (Threshold suppression)
  4. **Geo-Tagging** (WGS84 SRID 4326 GIS mapping)
- [ ] Confirm automatic redirection to the survey detail page (`/surveys/:id`).

### Step 3: Acoustic Waterfall Viewer & Bounding Box Interactivity
- [ ] On `/surveys/:id`, verify AI bounding box overlays sitting directly on target acoustic anomalies.
- [ ] Click a bounding box on the image canvas to confirm auto-highlighting in the side panel.
- [ ] Click **"Raw Sonar"** and **"Preprocessed (OpenCV CLAHE)"** toggle buttons to observe image matrix enhancement.

### Step 4: GIS Live Map & Multi-Criteria Filtering
- [ ] Navigate to `/map` (or click **"Explore Live GIS Map"**).
- [ ] Confirm Leaflet map markers are colored by risk level:
  - 🔴 **Red**: Critical Risk
  - 🟠 **Orange**: High Risk
  - 🟡 **Yellow**: Medium Risk
  - 🟢 **Green**: Low Risk
- [ ] Click any marker to open its interactive GIS Popup containing:
  - Hazard class & risk badges
  - Sonar crop thumbnail preview
  - Coordinates & confidence score
  - Direct **"Confirm"** / **"Reject"** verification actions.

### Step 5: Human-in-the-Loop Expert Verification Audit
- [ ] Navigate to `/verify`.
- [ ] Review the top prioritized hazard. Click **"Confirm Hazard"** (or press key `C`).
- [ ] Review the next hazard. Click **"Reject Detection"** (or press key `R`).
- [ ] Return to `/dashboard` and verify **"Pending Verification"** KPI decreases accordingly.

### Step 6: Multi-Format Report Generator Audit
- [ ] Navigate to `/reports`.
- [ ] Select a survey from the survey picker dropdown.
- [ ] Test exporting all 5 supported GIS & document formats:
  - 📄 **PDF Document**: Printable official report with summary metrics table
  - 🌐 **GeoJSON**: Standard WGS84 SRID 4326 spatial payload
  - 🗺️ **KML**: Google Earth / QGIS placemark XML
  - 📊 **CSV Table**: Tabular spreadsheet data
  - 📦 **JSON API**: Full structured developer payload
- [ ] Open each file to verify non-empty valid content.

### Step 7: SPA Refresh & Direct Route Reliability
- [ ] Perform a hard browser refresh (`Ctrl+F5` or `Cmd+Shift+R`) on each route:
  - `/`
  - `/dashboard`
  - `/analyze`
  - `/surveys/surv-mumbai-001`
  - `/map`
  - `/verify`
  - `/reports`
  - `/research`
- [ ] Confirm zero 404 errors, zero blank white screens, and zero red browser console errors.

### Step 8: Offline Backend Resilience & Error Recovery
- [ ] Stop the FastAPI backend server process (`uvicorn backend.main:app`).
- [ ] Reload `/dashboard`.
- [ ] Confirm the UI gracefully displays an offline alert banner: *"Backend Connection Unreachable: Displaying offline demo telemetry"*.
- [ ] Click **"Retry Connection"** button to confirm resilient reconnection attempt.

---

## 🛠️ Automated QA Test Suite Commands

```bash
# Run 16-point WCAG AA Color Contrast Audit
npm run test:contrast

# Run Full 8-Step Automated E2E QA Verification Flow
node scripts/run_e2e_qa.js
```
