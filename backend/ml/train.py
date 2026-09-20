import os
import shutil
import argparse
import sys
import time
import json
import logging
import random
from collections import defaultdict
import torch
import yaml
from ultralytics import YOLO

def setup_logger(log_file):
    os.makedirs(os.path.dirname(log_file), exist_ok=True)
    logger = logging.getLogger("AquaGuard_Train")
    logger.setLevel(logging.INFO)
    logger.handlers = []

    c_handler = logging.StreamHandler(sys.stdout)
    c_handler.setLevel(logging.INFO)
    c_format = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s', datefmt='%Y-%m-%d %H:%M:%S')
    c_handler.setFormatter(c_format)
    logger.addHandler(c_handler)

    f_handler = logging.FileHandler(log_file, mode='a', encoding='utf-8')
    f_handler.setLevel(logging.INFO)
    f_format = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s', datefmt='%Y-%m-%d %H:%M:%S')
    f_handler.setFormatter(f_format)
    logger.addHandler(f_handler)

    return logger

def create_class_safe_subset(data_yaml_path: str, fraction: float, seed: int = 42, logger=None) -> str:
    """
    Builds a seeded random subset of training images sampled per class so every class keeps
    roughly the same fraction of its images (background tiles included proportionally).
    Writes image list to datasets/drishti-sss/train_subset_<fraction>.txt and creates
    data_subset_<fraction>.yaml pointing to that file.
    Validates that no class falls below 40% of its full-set share.
    """
    def log_print(msg):
        if logger:
            logger.info(msg)
        else:
            print(msg)

    with open(data_yaml_path, 'r', encoding='utf-8') as f:
        data_config = yaml.safe_load(f)

    dataset_dir = os.path.abspath(os.path.dirname(data_yaml_path))
    train_rel = data_config.get('train', 'train/images')
    if os.path.isabs(train_rel):
        train_img_dir = train_rel
    else:
        train_img_dir = os.path.abspath(os.path.join(dataset_dir, train_rel))

    if 'images' in train_img_dir:
        train_lbl_dir = train_img_dir.replace('images', 'labels')
    else:
        train_lbl_dir = os.path.join(dataset_dir, 'train', 'labels')

    valid_exts = ('.jpg', '.png', '.jpeg', '.bmp', '.tiff')
    img_files = [
        os.path.join(train_img_dir, f) for f in os.listdir(train_img_dir)
        if f.lower().endswith(valid_exts)
    ]
    img_files.sort()

    img_to_classes = {}
    full_class_counts = defaultdict(int)

    for img_path in img_files:
        base_name = os.path.splitext(os.path.basename(img_path))[0]
        lbl_path = os.path.join(train_lbl_dir, base_name + '.txt')

        classes_in_img = set()
        if os.path.exists(lbl_path):
            with open(lbl_path, 'r', encoding='utf-8') as lf:
                for line in lf:
                    parts = line.strip().split()
                    if parts:
                        try:
                            cls_id = int(parts[0])
                            classes_in_img.add(cls_id)
                            full_class_counts[cls_id] += 1
                        except ValueError:
                            pass

        if not classes_in_img:
            classes_in_img.add(0)
            full_class_counts[0] += 0

        img_to_classes[img_path] = classes_in_img

    bucket_images = defaultdict(list)
    for img_path, cset in img_to_classes.items():
        chosen_cls = min(cset, key=lambda c: (full_class_counts[c] if full_class_counts[c] > 0 else 999999))
        bucket_images[chosen_cls].append(img_path)

    rng = random.Random(seed)
    selected_img_set = set()

    for cls_id, imgs in bucket_images.items():
        rng.shuffle(imgs)
        k = max(1, int(round(len(imgs) * fraction)))
        selected_img_set.update(imgs[:k])

    subset_class_counts = defaultdict(int)
    for img_path in selected_img_set:
        base_name = os.path.splitext(os.path.basename(img_path))[0]
        lbl_path = os.path.join(train_lbl_dir, base_name + '.txt')
        if os.path.exists(lbl_path):
            with open(lbl_path, 'r', encoding='utf-8') as lf:
                for line in lf:
                    parts = line.strip().split()
                    if parts:
                        try:
                            cls_id = int(parts[0])
                            subset_class_counts[cls_id] += 1
                        except ValueError:
                            pass

    names_map = data_config.get('names', {})
    if isinstance(names_map, list):
        names_map = {i: name for i, name in enumerate(names_map)}

    log_print("=" * 80)
    log_print(f"CLASS-SAFE SUBSET SAMPLING SUMMARY (Target Fraction: {fraction * 100:.1f}%)")
    log_print("=" * 80)
    log_print(f"{'ID':<4} | {'Class Name':<20} | {'Full Instances':<14} | {'Subset Instances':<16} | {'Class Share':<12} | Status")
    log_print("-" * 80)

    error_classes = []
    all_class_ids = sorted(set(list(full_class_counts.keys()) + list(names_map.keys())))
    for cls_id in all_class_ids:
        cname = names_map.get(cls_id, f"class_{cls_id}")
        full_cnt = full_class_counts[cls_id]
        sub_cnt = subset_class_counts[cls_id]

        if full_cnt > 0:
            share = sub_cnt / full_cnt
            min_required = fraction * 0.40
            if share < min_required:
                status = "FAIL (<40% share)"
                error_classes.append((cls_id, cname, share, min_required))
            else:
                status = "OK"
        else:
            share = 0.0
            status = "N/A (0 examples)"

        log_print(f"{cls_id:<4} | {cname:<20} | {full_cnt:<14} | {sub_cnt:<16} | {share*100:>10.1f}% | {status}")

    log_print("=" * 80)

    if error_classes:
        err_msg = f"Class-safe sampling failed: Classes {[c[1] for c in error_classes]} fell below 40% of their full-set share!"
        logger.error(err_msg)
        raise ValueError(err_msg)

    subset_txt_path = os.path.join(dataset_dir, f"train_subset_{fraction}.txt")
    with open(subset_txt_path, 'w', encoding='utf-8') as f:
        for img_path in sorted(selected_img_set):
            f.write(img_path.replace('\\', '/') + '\n')

    data_subset_config = dict(data_config)
    data_subset_config['train'] = subset_txt_path.replace('\\', '/')
    
    subset_yaml_path = os.path.join(dataset_dir, f"data_subset_{fraction}.yaml")
    with open(subset_yaml_path, 'w', encoding='utf-8') as f:
        yaml.safe_dump(data_subset_config, f, sort_keys=False)

    log_print(f"[Class-Safe Sampling] Saved subset file list to: {subset_txt_path}")
    log_print(f"[Class-Safe Sampling] Saved subset data config to: {subset_yaml_path}\n")

    return subset_yaml_path

def main():
    parser = argparse.ArgumentParser(description="Train YOLOv11 on DRISHTI-SSS Sonar Dataset with Class-Safe Sampling")
    parser.add_argument('--profile', type=str, default='cpu', choices=['cpu', 'gpu', 'auto'], help='Training profile (default: cpu)')
    parser.add_argument('--data', type=str, default=os.path.join(os.path.dirname(__file__), '..', '..', 'datasets', 'drishti-sss', 'data.yaml'), help='Path to data.yaml')
    parser.add_argument('--epochs', type=int, default=None, help='Number of epochs (default: 25 for CPU profile, 100 for GPU)')
    parser.add_argument('--patience', type=int, default=None, help='Early stopping patience (default: 8 for CPU profile)')
    parser.add_argument('--batch', type=int, default=None, help='Batch size (default: 8 for CPU profile, -1 for GPU auto)')
    parser.add_argument('--imgsz', type=int, default=None, help='Image resolution (default: 416 for CPU profile, 640 for GPU)')
    parser.add_argument('--model', type=str, default=None, help='Base model checkpoint (default: yolo11n.pt for CPU profile)')
    parser.add_argument('--workers', type=int, default=None, help='Data loader workers (0 automatically forced on Windows)')
    parser.add_argument('--fraction', type=float, default=1.0, help='Fraction of dataset to train on (0.0 to 1.0, default: 1.0)')
    parser.add_argument('--resume', action='store_true', help='Resume from last checkpoint in backend/ml/runs/')
    parser.add_argument('--save-period', type=int, default=1, help='Save checkpoint every N epochs (default: 1)')
    parser.add_argument('--seed', type=int, default=42, help='Reproducible random seed (default: 42)')
    parser.add_argument('--device', type=str, default=None, help='Hardware device (cpu or 0)')
    parser.add_argument('--dry-run', action='store_true', help='Verify arguments and class-safe sampling without starting training')
    args = parser.parse_args()

    is_cpu_profile = (args.profile.lower() == 'cpu')
    
    profile_name = "CPU-lite" if is_cpu_profile else "GPU-Full"
    model_name = args.model if args.model else ('yolo11n.pt' if is_cpu_profile else 'yolo11s.pt')
    imgsz = args.imgsz if args.imgsz is not None else (416 if is_cpu_profile else 640)
    epochs = args.epochs if args.epochs is not None else (25 if is_cpu_profile else 100)
    patience = args.patience if args.patience is not None else (8 if is_cpu_profile else 20)
    batch = args.batch if args.batch is not None else (8 if is_cpu_profile else -1)
    device = args.device if args.device is not None else ('cpu' if is_cpu_profile else ('0' if torch.cuda.is_available() else 'cpu'))
    
    # Requirement 2: close_mosaic=3 for runs with epochs < 20
    close_mosaic_val = 3 if epochs < 20 else 10

    if os.name == 'nt':
        workers = 0
    else:
        workers = args.workers if args.workers is not None else (2 if is_cpu_profile else 8)

    project_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), 'runs'))
    log_file = os.path.join(project_dir, 'train.log')
    logger = setup_logger(log_file)

    data_path = os.path.abspath(args.data)
    if not os.path.exists(data_path):
        logger.error(f"data.yaml not found at {data_path}")
        raise FileNotFoundError(f"data.yaml not found at {data_path}. Please inspect dataset first.")

    # Requirement 1: Class-safe fraction sampling
    if args.fraction < 1.0:
        logger.info(f"[Class-Safe Sampling] Building class-balanced subset for fraction={args.fraction} (seed={args.seed})...")
        effective_data_path = create_class_safe_subset(data_path, args.fraction, seed=args.seed, logger=logger)
    else:
        effective_data_path = data_path

    name_run = 'drishti_yolov11_run'
    ckpt_dir = os.path.join(project_dir, name_run, 'weights')
    last_ckpt = os.path.join(ckpt_dir, 'last.pt')

    logger.info("=" * 80)
    logger.info(f"Starting YOLOv11 Sonar Training Pipeline [{profile_name} Profile]")
    logger.info(f"Dataset Config : {effective_data_path}")
    logger.info(f"Base Model     : {model_name}")
    logger.info(f"Image Resolution: {imgsz}x{imgsz}")
    logger.info(f"Epochs / Patience: {epochs} / {patience}")
    logger.info(f"Close Mosaic   : {close_mosaic_val} (Epochs < 20 -> close_mosaic=3)")
    logger.info(f"Batch Size     : {batch}")
    logger.info(f"Workers / OS   : {workers} (OS: {os.name})")
    logger.info(f"Data Fraction  : {args.fraction * 100:.1f}%")
    logger.info(f"Device         : {device}")
    logger.info(f"Resume Mode    : {args.resume} (Last Ckpt: {last_ckpt if os.path.exists(last_ckpt) else 'None'})")
    if args.dry_run:
        logger.info("[DRY RUN] Argument parsing and class-safe sampling verified. Skipping training execution.")
    logger.info("=" * 80)

    if args.dry_run:
        print("[DRY RUN SUCCESS] Configuration verified successfully.")
        return

    # Initialize or resume model
    if args.resume and os.path.exists(last_ckpt):
        logger.info(f"Resuming training from checkpoint: {last_ckpt}")
        model = YOLO(last_ckpt)
        results = model.train(
            data=effective_data_path,
            epochs=epochs,
            patience=patience,
            batch=batch,
            imgsz=imgsz,
            workers=workers,
            close_mosaic=close_mosaic_val,
            save_period=args.save_period,
            seed=args.seed,
            device=device,
            project=project_dir,
            name=name_run,
            exist_ok=True,
            resume=True
        )
    else:
        if args.resume:
            logger.warning(f"Resume requested but checkpoint {last_ckpt} not found. Starting new training.")
        model = YOLO(model_name)
        results = model.train(
            data=effective_data_path,
            epochs=epochs,
            patience=patience,
            batch=batch,
            imgsz=imgsz,
            workers=workers,
            close_mosaic=close_mosaic_val,
            save_period=args.save_period,
            seed=args.seed,
            device=device,
            project=project_dir,
            name=name_run,
            exist_ok=True,
            # Sonar Augmentations
            hsv_h=0.0,
            hsv_s=0.0,
            hsv_v=0.2,
            scale=0.5,
            translate=0.1,
            fliplr=0.5,
            flipud=0.0,
            mosaic=1.0,
            mixup=0.1
        )

    clean_model_name = os.path.basename(model_name).replace('.pt', '')
    train_meta = {
        "profile": profile_name,
        "model_name": clean_model_name,
        "imgsz": imgsz,
        "epochs": epochs,
        "fraction": args.fraction,
        "device": device,
        "batch": batch,
        "training_date": time.strftime("%Y-%m-%d %H:%M:%S")
    }

    run_meta_path = os.path.join(project_dir, name_run, 'train_meta.json')
    with open(run_meta_path, 'w', encoding='utf-8') as f:
        json.dump(train_meta, f, indent=2)

    target_models_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'models'))
    os.makedirs(target_models_dir, exist_ok=True)
    
    best_weights_src = os.path.join(project_dir, name_run, 'weights', 'best.pt')
    best_weights_dst = os.path.join(target_models_dir, 'best.pt')
    meta_dst = os.path.join(target_models_dir, 'train_meta.json')

    with open(meta_dst, 'w', encoding='utf-8') as f:
        json.dump(train_meta, f, indent=2)

    if os.path.exists(best_weights_src):
        shutil.copy2(best_weights_src, best_weights_dst)
        logger.info(f"[Success] Copied best weights to: {best_weights_dst}")
        logger.info(f"[Success] Copied training metadata to: {meta_dst}")
    else:
        logger.warning(f"[Warning] Best weights file not found at {best_weights_src}")

if __name__ == '__main__':
    main()
