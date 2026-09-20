# DRISHTI-SSS YOLOv11 Model Training Guide

This guide explains how to train YOLOv11 on the **DRISHTI-SSS** Side-Scan Sonar (SSS) dataset for AquaGuard AI.

---

## Environment Status
- **CUDA GPU Detection**: `CUDA Available: False` (No local Nvidia GPU found).
- **Training Strategy**: Google Colab T4 GPU (free tier) via `backend/ml/train_colab.ipynb`.

---

## Instructions for Google Colab Training

### Step 1: Zip & Upload Dataset
1. Zip the `datasets/drishti-sss/` directory into `drishti-sss.zip`.
2. Upload `drishti-sss.zip` to your Google Drive under a folder named `AquaGuard_ML/`.

### Step 2: Open and Run Notebook
1. Open [Google Colab](https://colab.research.google.com).
2. Upload `backend/ml/train_colab.ipynb` to Colab.
3. Set Runtime to **GPU** (`Runtime -> Change runtime type -> T4 GPU`).
4. Click **Run All** (`Ctrl + F9`).

### Step 3: Download Trained Weights & Metrics
Once training completes (~25-35 minutes on T4 GPU), the notebook automatically exports the following files to `AquaGuard_ML/` in your Google Drive:
- `best.pt` (Trained PyTorch weights)
- `metrics.json` (Real evaluation metrics evaluated strictly on the **TEST** split)
- `confusion_matrix.png` & `PR_curve.png` (Performance plots)

### Step 4: Place Files in AquaGuard AI Repository
Copy the downloaded files to your local repository:
1. `best.pt` -> `backend/models/best.pt`
2. `metrics.json` -> `backend/models/metrics.json`
3. `confusion_matrix.png` -> `frontend/public/model/confusion_matrix.png`
4. `PR_curve.png` -> `frontend/public/model/PR_curve.png`

---

## Local GPU Training Command (If CUDA GPU Available)

```bash
python backend/ml/train.py --profile gpu --epochs 100 --batch 16 --imgsz 640
```

---

## How to run the CPU training in your own terminal

If you do not have a dedicated NVIDIA CUDA GPU, you can run the CPU-lite training profile directly on your local CPU.

### 1. Benchmark CPU Training Speed (1 Epoch on 10% Dataset)
Run the benchmark script to measure wall-clock speed per epoch and calculate total training estimates:
```bash
python backend/ml/benchmark.py
```
*Progress log is automatically recorded in `backend/ml/runs/train.log`.*

### 2. Start Full CPU-Lite Training
Train YOLOv11n at 416x416 resolution for 25 epochs on CPU:
```bash
python backend/ml/train.py --profile cpu
```
*Custom options available:*
- Train on a subset of data: `python backend/ml/train.py --profile cpu --fraction 0.5`
- Custom epochs or batch size: `python backend/ml/train.py --profile cpu --epochs 15 --batch 16`

### 3. Resume Interrupted CPU Training
To resume training from the last saved checkpoint (`backend/ml/runs/drishti_yolov11_run/weights/last.pt`):
```bash
python backend/ml/train.py --profile cpu --resume
```

### 4. Evaluate Trained Weights on TEST Split
After training completes, run honest evaluation on the held-out 700-image test set:
```bash
python backend/ml/evaluate.py
```
*This outputs `backend/models/metrics.json` recording CPU-lite metadata tags and performance statistics.*

