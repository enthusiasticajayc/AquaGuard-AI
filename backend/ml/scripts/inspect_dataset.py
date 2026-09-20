import os
import glob
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from PIL import Image
import json

DATASET_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'datasets', 'drishti-sss'))
REPORT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'reports', 'dataset_summary'))
os.makedirs(REPORT_DIR, exist_ok=True)

CLASS_NAMES = {
    0: 'crab_pot',
    1: 'submarine_pipeline',
    2: 'shipwreck',
    3: 'ghost_net',
    4: 'mine_cylinder'
}

SPLITS = ['train', 'val', 'test']

def inspect_dataset():
    print("=" * 80)
    print(f"DRISHTI-SSS Dataset Inspection Script (Phase 1)")
    print(f"Dataset Location: {DATASET_DIR}")
    print("=" * 80)

    # 1. Delete all *.cache files
    cache_files = []
    for root, dirs, files in os.walk(DATASET_DIR):
        for file in files:
            if file.endswith('.cache'):
                full_path = os.path.join(root, file)
                cache_files.append(full_path)
                try:
                    os.remove(full_path)
                    print(f"[Clean] Removed stale cache file: {full_path}")
                except Exception as e:
                    print(f"[Warning] Failed to delete cache file {full_path}: {e}")

    summary = {
        'split_stats': {},
        'class_counts': {split: {cid: 0 for cid in CLASS_NAMES.keys()} for split in SPLITS},
        'problems': [],
        'image_dims': {'widths': [], 'heights': []}
    }

    total_images_all = 0
    total_labels_all = 0

    for split in SPLITS:
        img_dir = os.path.join(DATASET_DIR, split, 'images')
        lbl_dir = os.path.join(DATASET_DIR, split, 'labels')

        if not os.path.exists(img_dir) or not os.path.exists(lbl_dir):
            summary['problems'].append(f"Missing directory for split {split}: {img_dir} or {lbl_dir}")
            continue

        images = sorted(glob.glob(os.path.join(img_dir, '*.*')))
        labels = sorted(glob.glob(os.path.join(lbl_dir, '*.txt')))

        img_basenames = {os.path.splitext(os.path.basename(f))[0]: f for f in images}
        lbl_basenames = {os.path.splitext(os.path.basename(f))[0]: f for f in labels}

        missing_labels = set(img_basenames.keys()) - set(lbl_basenames.keys())
        orphan_labels = set(lbl_basenames.keys()) - set(img_basenames.keys())

        if missing_labels:
            summary['problems'].append(f"[{split}] {len(missing_labels)} images have missing label files! First 3: {list(missing_labels)[:3]}")
        if orphan_labels:
            summary['problems'].append(f"[{split}] {len(orphan_labels)} label files have no corresponding image! First 3: {list(orphan_labels)[:3]}")

        empty_label_files = 0
        total_boxes = 0

        for base_name, img_path in img_basenames.items():
            # Check Image Dimensions
            try:
                with Image.open(img_path) as img:
                    w, h = img.size
                    summary['image_dims']['widths'].append(w)
                    summary['image_dims']['heights'].append(h)
            except Exception as e:
                summary['problems'].append(f"[{split}] Failed to open image {img_path}: {e}")

            # Inspect Label File
            lbl_path = lbl_basenames.get(base_name)
            if not lbl_path:
                continue

            with open(lbl_path, 'r', encoding='utf-8') as f:
                lines = [line.strip() for line in f.readlines() if line.strip()]

            if not lines:
                empty_label_files += 1

            for line_idx, line in enumerate(lines):
                parts = line.split()
                if len(parts) != 5:
                    summary['problems'].append(f"[{split}] Malformed label line in {lbl_path}:{line_idx+1} -> '{line}' (expected 5 items)")
                    continue

                try:
                    cid = int(parts[0])
                    xc, yc, w, h = map(float, parts[1:])
                except ValueError:
                    summary['problems'].append(f"[{split}] Non-numeric label line in {lbl_path}:{line_idx+1} -> '{line}'")
                    continue

                # Class ID check
                if cid not in CLASS_NAMES:
                    summary['problems'].append(f"[{split}] Unknown class_id {cid} in {lbl_path}:{line_idx+1}")
                else:
                    summary['class_counts'][split][cid] += 1
                    total_boxes += 1

                # Range check (0 to 1)
                if not (0.0 <= xc <= 1.0 and 0.0 <= yc <= 1.0 and 0.0 <= w <= 1.0 and 0.0 <= h <= 1.0):
                    summary['problems'].append(f"[{split}] Out-of-range normalized box coordinates in {lbl_path}:{line_idx+1} -> xc={xc}, yc={yc}, w={w}, h={h}")

        summary['split_stats'][split] = {
            'images_count': len(images),
            'labels_count': len(labels),
            'empty_label_files': empty_label_files,
            'total_boxes': total_boxes
        }

        total_images_all += len(images)
        total_labels_all += len(labels)

    # Generate charts
    plt.figure(figsize=(10, 6))
    x_labels = [f"{cid}: {CLASS_NAMES[cid]}" for cid in CLASS_NAMES.keys()]
    x = range(len(x_labels))
    width = 0.25

    train_counts = [summary['class_counts']['train'][cid] for cid in CLASS_NAMES.keys()]
    val_counts = [summary['class_counts']['val'][cid] for cid in CLASS_NAMES.keys()]
    test_counts = [summary['class_counts']['test'][cid] for cid in CLASS_NAMES.keys()]

    plt.bar([i - width for i in x], train_counts, width=width, label='Train', color='#3B82F6')
    plt.bar(x, val_counts, width=width, label='Val', color='#10B981')
    plt.bar([i + width for i in x], test_counts, width=width, label='Test', color='#F59E0B')

    plt.xlabel('Class ID & Name', fontweight='bold')
    plt.ylabel('Instance Count', fontweight='bold')
    plt.title('DRISHTI-SSS Dataset Class Instance Distribution Per Split', fontsize=12, fontweight='bold')
    plt.xticks(x, x_labels, rotation=15, ha='right')
    plt.legend()
    plt.grid(axis='y', linestyle='--', alpha=0.5)
    plt.tight_layout()
    chart_path = os.path.join(REPORT_DIR, 'class_distribution.png')
    plt.savefig(chart_path, dpi=200)
    plt.close()

    # Image Resolution Chart
    plt.figure(figsize=(8, 5))
    plt.hist(summary['image_dims']['widths'], bins=20, color='#14B8A6', edgecolor='black')
    plt.xlabel('Image Width / Height (px)', fontweight='bold')
    plt.ylabel('Image Tile Count', fontweight='bold')
    plt.title('DRISHTI-SSS Image Tile Dimension Histogram', fontsize=12, fontweight='bold')
    plt.grid(axis='y', linestyle='--', alpha=0.5)
    plt.tight_layout()
    dim_chart_path = os.path.join(REPORT_DIR, 'image_dimensions.png')
    plt.savefig(dim_chart_path, dpi=200)
    plt.close()

    # Create datasets/drishti-sss/data.yaml
    abs_dataset_dir = os.path.abspath(DATASET_DIR).replace('\\', '/')
    data_yaml_content = f"""# DRISHTI-SSS Dataset Configuration for Ultralytics YOLOv11
path: {abs_dataset_dir}
train: train/images
val: val/images
test: test/images

nc: 5
names:
  0: crab_pot
  1: submarine_pipeline
  2: shipwreck
  3: ghost_net
  4: mine_cylinder
"""
    yaml_file_path = os.path.join(DATASET_DIR, 'data.yaml')
    with open(yaml_file_path, 'w', encoding='utf-8') as f:
        f.write(data_yaml_content)
    print(f"[Yaml] Created datasets/drishti-sss/data.yaml successfully.")

    # Also save json report
    report_json_path = os.path.join(REPORT_DIR, 'summary_report.json')
    with open(report_json_path, 'w', encoding='utf-8') as f:
        json.dump(summary, f, indent=2)

    # Display Printout
    print("\n" + "=" * 80)
    print("DATASET SPLIT SUMMARY:")
    print("=" * 80)
    for split, stats in summary['split_stats'].items():
        print(f"Split: {split:<6} | Images: {stats['images_count']:<5} | Labels: {stats['labels_count']:<5} | Background (Empty) Tiles: {stats['empty_label_files']:<4} | Total Bounding Boxes: {stats['total_boxes']}")

    print("\n" + "=" * 80)
    print("PER-CLASS INSTANCE COUNTS (Train / Val / Test):")
    print("=" * 80)
    print(f"{'Class ID':<10} | {'Class Name':<22} | {'Train':<7} | {'Val':<7} | {'Test':<7} | {'Total'}")
    print("-" * 80)
    for cid, cname in CLASS_NAMES.items():
        tr = summary['class_counts']['train'][cid]
        va = summary['class_counts']['val'][cid]
        te = summary['class_counts']['test'][cid]
        tot = tr + va + te
        print(f"{cid:<10} | {cname:<22} | {tr:<7} | {va:<7} | {te:<7} | {tot}")
    print("-" * 80)

    # Width/Height Stats
    widths = summary['image_dims']['widths']
    heights = summary['image_dims']['heights']
    if widths:
        min_w, max_w, avg_w = min(widths), max(widths), sum(widths)/len(widths)
        min_h, max_h, avg_h = min(heights), max(heights), sum(heights)/len(heights)
        print(f"Image Tile Dimensions: Min={min_w}x{min_h} | Max={max_w}x{max_h} | Avg={avg_w:.1f}x{avg_h:.1f}")

    print("\n" + "=" * 80)
    print(f"FLAGS & AUDIT PROBLEMS FOUND ({len(summary['problems'])}):")
    print("=" * 80)
    if not summary['problems']:
        print("[OK] CLEAN! No label format errors, out-of-bounds coordinates, or missing files detected.")
    else:
        for p in summary['problems']:
            print(f"  ❌ {p}")
    print("=" * 80 + "\n")

if __name__ == '__main__':
    inspect_dataset()
