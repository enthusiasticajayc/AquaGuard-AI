import os
import json
from fastapi import APIRouter

router = APIRouter(prefix="/research", tags=["Research"])

@router.get("/metrics")
def get_research_metrics():
    """
    Returns YOLOv11 evaluation benchmark metrics on DRISHTI-SSS test split,
    or dataset summary facts and pipeline status if metrics.json is missing.
    """
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
    models_metrics_path = os.path.join(base_dir, "backend/models/metrics.json")
    
    if os.path.exists(models_metrics_path):
        try:
            with open(models_metrics_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                data["exists"] = True
                return data
        except Exception as e:
            print(f"[ResearchRouter] Error reading {models_metrics_path}: {e}")

    # Check real file status for 4-step pipeline
    data_yaml_exists = os.path.exists(os.path.join(base_dir, "datasets/drishti-sss/data.yaml"))
    train_log_exists = os.path.exists(os.path.join(base_dir, "backend/ml/runs/train.log")) or os.path.exists(os.path.join(base_dir, "backend/models/best.pt"))
    
    # Load dataset_summary.json if available
    summary_path = os.path.join(base_dir, "backend/ml/reports/dataset_summary.json")
    dataset_summary = None
    if os.path.exists(summary_path):
        try:
            with open(summary_path, "r", encoding="utf-8") as sf:
                dataset_summary = json.load(sf)
        except Exception:
            pass

    return {
        "exists": False,
        "status_chip": "Evaluation in progress",
        "pipeline_steps": {
            "dataset_audit": "done" if data_yaml_exists else "pending",
            "training": "in_progress" if train_log_exists else "pending",
            "test_evaluation": "pending",
            "results_published": "pending"
        },
        "dataset_summary": dataset_summary
    }
