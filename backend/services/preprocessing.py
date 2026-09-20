import cv2
import numpy as np

def lee_filter(img: np.ndarray, kernel_size: int = 7) -> np.ndarray:
    """
    Lee Speckle Filter for Side-Scan Sonar (MMSE Local Estimate):
    Parameters:
    - kernel_size: 7x7 window size (exact window specified in DRISHTI-SSS dataset README).
    
    Multiplicative acoustic speckle noise model: I_obs = I_true * n
    Preserves edges while smoothing flat seabed acoustic noise.
    """
    img_f = img.astype(np.float32)
    mean = cv2.blur(img_f, (kernel_size, kernel_size))
    mean_sq = cv2.blur(img_f**2, (kernel_size, kernel_size))
    var = np.maximum(0.0, mean_sq - mean**2)
    
    # Global noise variance estimate
    overall_var = float(np.var(img_f))
    weights = var / (var + overall_var + 1e-5)
    
    output = mean + weights * (img_f - mean)
    return np.clip(output, 0, 255).astype(np.uint8)

def preprocess_sonar_image(image_bytes: bytes, already_preprocessed: bool = False) -> bytes:
    """
    Shared Side-Scan Sonar (SSS) Preprocessing Pipeline:
    1. Check already_preprocessed flag - if True, return raw image_bytes (skip CLAHE/Lee).
    2. Convert image to Grayscale.
    3. Apply Lee Speckle Filter (7x7 kernel).
    4. Apply CLAHE (clipLimit=3.0, tileGridSize=8x8).
    5. Return JPEG encoded bytes.
    """
    if already_preprocessed:
        print("[Preprocessing] Skipping Lee + CLAHE pipeline (already_preprocessed=True)")
        return image_bytes

    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img is None:
        return image_bytes

    # Convert to Grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # 1. Lee Speckle Filter (7x7 kernel)
    despeckled = lee_filter(gray, kernel_size=7)
    
    # 2. CLAHE (Contrast Limited Adaptive Histogram Equalization, clip=3.0, grid=8x8)
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    enhanced = clahe.apply(despeckled)
    
    # Convert back to 3-channel color image
    processed_bgr = cv2.cvtColor(enhanced, cv2.COLOR_GRAY2BGR)
    
    success, encoded_img = cv2.imencode('.jpg', processed_bgr, [cv2.IMWRITE_JPEG_QUALITY, 92])
    if success:
        return encoded_img.tobytes()
    return image_bytes
