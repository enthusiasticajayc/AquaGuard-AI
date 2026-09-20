import os
import shutil
import json
import datetime
import numpy as np
from ultralytics import YOLO

ACTIVE_CLASSES = {
    1: 'submarine_pipeline',
    2: 'shipwreck',
    3: 'ghost_net',
    4: 'mine_cylinder'
}

def main():
    import argparse
    parser = argparse.ArgumentParser(description="Evaluate trained YOLOv11 model on DRISHTI-SSS TEST split")
    parser.add_argument('--model', type=str, default=None, help='Path to trained weights file (default: backend/models/best.pt)')
    parser.add_argument('--data', type=str, default=None, help='Path to data.yaml dataset config')
    parser.add_argument('--dry-run', action='store_true', help='Verify evaluation arguments and paths without executing evaluation')
    args = parser.parse_args()

    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
    data_yaml = os.path.abspath(args.data) if args.data else os.path.join(base_dir, 'datasets', 'drishti-sss', 'data.yaml')
    model_path = os.path.abspath(args.model) if args.model else os.path.join(base_dir, 'backend', 'models', 'best.pt')
    meta_path = os.path.join(base_dir, 'backend', 'models', 'train_meta.json')
    run_meta_path = os.path.join(base_dir, 'backend', 'ml', 'runs', 'drishti_yolov11_run', 'train_meta.json')

    if args.dry_run:
        print("=" * 80)
        print(f"[DRY RUN] DRISHTI-SSS Evaluation Configuration Check")
        print(f"Data Config : {data_yaml} (Exists: {os.path.exists(data_yaml)})")
        print(f"Model Path  : {model_path} (Exists: {os.path.exists(model_path)})")
        print("=" * 80)
        print("[DRY RUN SUCCESS] Evaluation CLI arguments verified successfully.")
        return

    if not os.path.exists(data_yaml):
        raise FileNotFoundError(f"data.yaml not found at {data_yaml}. Run inspect_dataset.py first.")

    if not os.path.exists(model_path):
        print(f"[Notice] Trained weights file {model_path} not found.")
        print("Please run backend/ml/train.py --profile cpu or train_colab.ipynb and place best.pt in backend/models/best.pt")
        return

    # Load metadata from train_meta.json if available
    train_meta = {}
    if os.path.exists(meta_path):
        with open(meta_path, 'r', encoding='utf-8') as f:
            train_meta = json.load(f)
    elif os.path.exists(run_meta_path):
        with open(run_meta_path, 'r', encoding='utf-8') as f:
            train_meta = json.load(f)

    profile_name = train_meta.get("profile", "CPU-lite")
    model_name = train_meta.get("model_name", "yolo11n")
    imgsz = train_meta.get("imgsz", 416)
    epochs_completed = train_meta.get("epochs", 25)
    fraction_used = train_meta.get("fraction", 1.0)

    print("=" * 80)
    print(f"DRISHTI-SSS YOLOv11 Honest Evaluation on TEST Split [{profile_name} Profile]")
    print(f"Model Path: {model_path}")
    print(f"Data Config: {data_yaml}")
    print(f"Model Name: {model_name} | Imgsz: {imgsz}px | Epochs: {epochs_completed} | Fraction: {fraction_used * 100:.1f}%")
    print("=" * 80)

    model = YOLO(model_path)

    project_dir = os.path.join(base_dir, 'backend', 'ml', 'runs')
    run_name = 'eval_test_split'

    results = model.val(
        data=data_yaml,
        split='test',
        imgsz=imgsz,
        project=project_dir,
        name=run_name,
        exist_ok=True
    )

    box_metrics = results.box
    names_dict = results.names

    per_class_ap50 = {}
    active_maps50 = []
    active_precisions = []
    active_recalls = []

    for idx, cname in names_dict.items():
        if idx == 0 or cname == 'crab_pot':
            continue # Exclude class 0 (crab_pot has 0 examples in release)
            
        try:
            c_result = box_metrics.class_result(idx)
            p = float(c_result[0])
            r = float(c_result[1])
            ap50 = float(c_result[2])
            active_precisions.append(p)
            active_recalls.append(r)
            active_maps50.append(ap50)
            per_class_ap50[cname] = ap50
        except Exception as e:
            print(f"[Eval] Warning parsing metrics for class {cname} (ID {idx}): {e}")

    avg_precision = float(np.mean(active_precisions)) if active_precisions else float(box_metrics.mp)
    avg_recall = float(np.mean(active_recalls)) if active_recalls else float(box_metrics.mr)
    avg_map50 = float(np.mean(active_maps50)) if active_maps50 else float(box_metrics.map50)
    avg_map50_95 = float(box_metrics.map)

    metrics_payload = {
        "exists": True,
        "dataset_name": "DRISHTI-SSS Side-Scan Sonar Benchmark",
        "training_date": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "model_architecture": "YOLOv11",
        "model_name": model_name,
        "imgsz": imgsz,
        "epochs": epochs_completed,
        "fraction": fraction_used,
        "profile": profile_name,
        "test_images_count": 700,
        "precision": avg_precision,
        "recall": avg_recall,
        "map50": avg_map50,
        "map50_95": avg_map50_95,
        "per_class_ap50": per_class_ap50
    }

    models_dir = os.path.join(base_dir, 'backend', 'models')
    os.makedirs(models_dir, exist_ok=True)
    metrics_file = os.path.join(models_dir, 'metrics.json')

    with open(metrics_file, 'w', encoding='utf-8') as f:
        json.dump(metrics_payload, f, indent=2)

    print(f"\n[Saved] Evaluation metrics saved to: {metrics_file}")
    print(json.dumps(metrics_payload, indent=2))

    public_model_dir = os.path.join(base_dir, 'frontend', 'public', 'model')
    os.makedirs(public_model_dir, exist_ok=True)

    eval_run_dir = os.path.join(project_dir, run_name)
    for plot_filename in ['confusion_matrix.png', 'PR_curve.png', 'F1_curve.png']:
        src_path = os.path.join(eval_run_dir, plot_filename)
        if os.path.exists(src_path):
            dst_path = os.path.join(public_model_dir, plot_filename)
            shutil.copy2(src_path, dst_path)
            print(f"[Copied] {plot_filename} -> {dst_path}")

    print("\n[Complete] Honest Evaluation Complete!")

if __name__ == '__main__':
    main()
