import os
import glob
import shutil
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

PUBLIC_SAMPLES_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend', 'public', 'samples'))
os.makedirs(PUBLIC_SAMPLES_DIR, exist_ok=True)

DATASET_IMAGES = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'datasets', 'drishti-sss', 'train', 'images'))

def create_procedural_sonar_image(filename, width=800, height=600):
    # Create dark acoustic sonar canvas
    arr = np.random.randint(10, 35, (height, width), dtype=np.uint8)
    
    # Add central nadir track (water column gap)
    nadir_center = width // 2
    nadir_width = 40
    arr[:, nadir_center - nadir_width//2 : nadir_center + nadir_width//2] = np.random.randint(2, 10, (height, nadir_width))
    
    # Add acoustic reflections (seabed texture & shadows)
    for _ in range(120):
        rx = np.random.randint(0, width)
        ry = np.random.randint(0, height)
        rw = np.random.randint(2, 6)
        rh = np.random.randint(15, 60)
        arr[max(0, ry-rh//2):min(height, ry+rh//2), max(0, rx-rw//2):min(width, rx+rw//2)] += np.random.randint(20, 70, dtype=np.uint8)
        
    # Contrast adjustment
    img = Image.fromarray(arr, mode='L')
    img = img.filter(ImageFilter.GaussianBlur(radius=0.8))
    
    # Convert to copper/teal side-scan sonar colormap
    rgb_img = Image.new("RGB", (width, height))
    pixels = img.load()
    rgb_pixels = rgb_img.load()
    
    for y in range(height):
        for x in range(width):
            val = pixels[x, y]
            # Deep ocean blue to cyan/amber acoustic return
            r = int(val * 0.8)
            g = int(val * 1.1)
            b = int(val * 1.3)
            rgb_pixels[x, y] = (min(255, r), min(255, g), min(255, b))
            
    save_path = os.path.join(PUBLIC_SAMPLES_DIR, filename)
    rgb_img.save(save_path, quality=92)
    print(f"[SampleGen] Created procedural sample image: {save_path}")

def generate_samples():
    print(f"Generating sample sonar images into: {PUBLIC_SAMPLES_DIR}")
    
    # Try copying real images from dataset if available
    sample_targets = {
        'sample_mumbai_raw.jpg': 'train/images',
        'sample_vizag_raw.jpg': 'val/images',
        'sample_gulf_raw.jpg': 'test/images'
    }
    
    for sample_name in ['sample_mumbai_raw.jpg', 'sample_vizag_raw.jpg', 'sample_gulf_raw.jpg']:
        drishti_imgs = glob.glob(os.path.join(os.path.dirname(__file__), '..', 'datasets', 'drishti-sss', '*', 'images', '*.jpg'))
        if drishti_imgs:
            src = np.random.choice(drishti_imgs)
            dst = os.path.join(PUBLIC_SAMPLES_DIR, sample_name)
            shutil.copy2(src, dst)
            print(f"[SampleGen] Copied real SSS dataset image -> {dst}")
        else:
            create_procedural_sonar_image(sample_name)

if __name__ == '__main__':
    generate_samples()
