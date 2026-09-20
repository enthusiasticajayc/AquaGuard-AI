import os
import sys
import time
import logging
from ultralytics import YOLO

def setup_logger(log_file):
    os.makedirs(os.path.dirname(log_file), exist_ok=True)
    logger = logging.getLogger("AquaGuard_Benchmark")
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

def main():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
    data_path = os.path.join(base_dir, 'datasets', 'drishti-sss', 'data.yaml')
    project_dir = os.path.join(base_dir, 'backend', 'ml', 'runs')
    log_file = os.path.join(project_dir, 'train.log')
    logger = setup_logger(log_file)

    if not os.path.exists(data_path):
        logger.error(f"data.yaml not found at {data_path}")
        raise FileNotFoundError(f"data.yaml not found at {data_path}")

    workers = 0 if os.name == 'nt' else 2

    logger.info("=" * 80)
    logger.info("Starting AquaGuard CPU Benchmark (1 Epoch on 10% Dataset Fraction)")
    logger.info(f"Model      : yolo11n.pt")
    logger.info(f"Resolution : 416x416")
    logger.info(f"Batch Size : 8")
    logger.info(f"Device     : CPU")
    logger.info(f"Fraction   : 0.1 (10% of training split)")
    logger.info(f"Workers    : {workers}")
    logger.info("=" * 80)

    model = YOLO('yolo11n.pt')

    start_time = time.time()

    model.train(
        data=data_path,
        epochs=1,
        patience=1,
        batch=8,
        imgsz=416,
        workers=workers,
        fraction=0.1,
        save=False,
        save_period=-1,
        seed=42,
        device='cpu',
        project=project_dir,
        name='benchmark_run',
        exist_ok=True,
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

    elapsed_sec = time.time() - start_time

    # Calculations
    sec_per_epoch_01 = elapsed_sec
    est_min_full_epoch = (sec_per_epoch_01 * 10.0) / 60.0
    
    hours_10 = (est_min_full_epoch * 10.0) / 60.0
    hours_15 = (est_min_full_epoch * 15.0) / 60.0
    hours_20 = (est_min_full_epoch * 20.0) / 60.0
    hours_25 = (est_min_full_epoch * 25.0) / 60.0

    output_summary = f"""
================================================================================
AQUAGUARD CPU BENCHMARK ESTIMATION REPORT
================================================================================
• Seconds for 1 Epoch on 10% dataset fraction : {sec_per_epoch_01:.2f} seconds
• Estimated minutes per epoch (Full 100% split) : {est_min_full_epoch:.2f} minutes

ESTIMATED TOTAL TRAINING TIME (CPU-LITE PROFILE):
- 10 Epochs : {hours_10:.2f} hours ({hours_10 * 60:.1f} minutes)
- 15 Epochs : {hours_15:.2f} hours ({hours_15 * 60:.1f} minutes)
- 20 Epochs : {hours_20:.2f} hours ({hours_20 * 60:.1f} minutes)
- 25 Epochs : {hours_25:.2f} hours ({hours_25 * 60:.1f} minutes)
================================================================================
"""

    logger.info(output_summary)
    print(output_summary)

if __name__ == '__main__':
    main()
