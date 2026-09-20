import os
import random
from abc import ABC, abstractmethod
from typing import List, Dict, Any
from backend.config import settings
from backend.services.risk_service import calculate_risk

class DetectorService(ABC):
    @abstractmethod
    def detect(self, image_bytes: bytes, confidence_threshold: float, start_lat: float, start_lon: float) -> List[Dict[str, Any]]:
        """Abstract method for object detection on sonar imagery."""
        pass
        
    @property
    @abstractmethod
    def is_mock(self) -> bool:
        pass


def nms_boxes(boxes: list, scores: list, iou_threshold: float = 0.45) -> list:
    """Non-Maximum Suppression (NMS) for merging candidate bounding boxes across overlapping tiles."""
    if not boxes:
        return []
    import numpy as np
    boxes_np = np.array(boxes) # [x1, y1, x2, y2]
    scores_np = np.array(scores)
    
    x1 = boxes_np[:, 0]
    y1 = boxes_np[:, 1]
    x2 = boxes_np[:, 2]
    y2 = boxes_np[:, 3]
    areas = (x2 - x1) * (y2 - y1)
    
    order = scores_np.argsort()[::-1]
    keep = []
    
    while order.size > 0:
        i = order[0]
        keep.append(i)
        
        xx1 = np.maximum(x1[i], x1[order[1:]])
        yy1 = np.maximum(y1[i], y1[order[1:]])
        xx2 = np.minimum(x2[i], x2[order[1:]])
        yy2 = np.minimum(y2[i], y2[order[1:]])
        
        w = np.maximum(0.0, xx2 - xx1)
        h = np.maximum(0.0, yy2 - yy1)
        inter = w * h
        
        ovr = inter / (areas[i] + areas[order[1:]] - inter + 1e-5)
        inds = np.where(ovr <= iou_threshold)[0]
        order = order[inds + 1]
        
    return keep

class YoloDetector(DetectorService):
    def __init__(self, weights_path: str):
        self.weights_path = weights_path
        self._model = None
        self.imgsz = 640
        self._load_model()
        
    def _load_model(self):
        try:
            from ultralytics import YOLO
            self._model = YOLO(self.weights_path)
            print(f"[YoloDetector] Successfully loaded YOLOv11 weights from {self.weights_path}")
            if hasattr(self._model, 'names'):
                print(f"[YoloDetector] Loaded model classes dynamically from model.names: {self._model.names}")
            self.imgsz = self._extract_imgsz()
            print(f"[YoloDetector] Dynamic tile resolution set to {self.imgsz}x{self.imgsz}px (matched to model training config)")
        except Exception as e:
            print(f"[YoloDetector] Warning: Could not load YOLO weights from {self.weights_path}: {e}")
            self._model = None

    def _extract_imgsz(self) -> int:
        if not self._model:
            return 640
        try:
            if hasattr(self._model, 'args') and isinstance(self._model.args, dict) and self._model.args.get('imgsz'):
                return int(self._model.args['imgsz'])
            if hasattr(self._model, 'overrides') and isinstance(self._model.overrides, dict) and self._model.overrides.get('imgsz'):
                return int(self._model.overrides['imgsz'])
            if hasattr(self._model, 'ckpt') and isinstance(self._model.ckpt, dict):
                train_args = self._model.ckpt.get('train_args', {})
                if isinstance(train_args, dict) and train_args.get('imgsz'):
                    return int(train_args['imgsz'])
            
            import json
            base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
            meta_file = os.path.join(base_dir, 'backend', 'models', 'train_meta.json')
            if os.path.exists(meta_file):
                with open(meta_file, 'r', encoding='utf-8') as f:
                    meta = json.load(f)
                    if 'imgsz' in meta:
                        return int(meta['imgsz'])
            metrics_file = os.path.join(base_dir, 'backend', 'models', 'metrics.json')
            if os.path.exists(metrics_file):
                with open(metrics_file, 'r', encoding='utf-8') as f:
                    m = json.load(f)
                    if 'imgsz' in m:
                        return int(m['imgsz'])
        except Exception as e:
            print(f"[YoloDetector] Notice: Defaulting imgsz to 640 ({e})")
        return 640

    @property
    def is_mock(self) -> bool:
        return False

    def detect(self, image_bytes: bytes, confidence_threshold: float, start_lat: float, start_lon: float) -> List[Dict[str, Any]]:
        if not self._model:
            raise RuntimeError("YOLO model is not initialized")
            
        import cv2
        import numpy as np
        
        # 1. Decode image bytes
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            return []

        # 2. Shared Preprocessing (Lee Filter + OpenCV CLAHE)
        from backend.services.preprocessing import preprocess_sonar_image
        preprocessed_bytes = preprocess_sonar_image(image_bytes, already_preprocessed=False)
        prep_nparr = np.frombuffer(preprocessed_bytes, np.uint8)
        processed_bgr = cv2.imdecode(prep_nparr, cv2.IMREAD_COLOR)
        if processed_bgr is None:
            processed_bgr = img

        img_h, img_w = processed_bgr.shape[:2]
        tile_size = self.imgsz
        overlap = int(tile_size * 0.20)
        step_size = tile_size - overlap

        candidates = []

        # Check if tiling is needed for large images (> 640x640)
        if img_w > tile_size or img_h > tile_size:
            # Generate overlapping 640x640 tile coordinates
            y_offsets = list(range(0, max(1, img_h - tile_size + 1), step_size))
            if y_offsets[-1] + tile_size < img_h:
                y_offsets.append(img_h - tile_size)

            x_offsets = list(range(0, max(1, img_w - tile_size + 1), step_size))
            if x_offsets[-1] + tile_size < img_w:
                x_offsets.append(img_w - tile_size)

            for y_off in y_offsets:
                for x_off in x_offsets:
                    tile = processed_bgr[y_off:y_off+tile_size, x_off:x_off+tile_size]
                    results = self._model(tile, conf=confidence_threshold, verbose=False)
                    for r in results:
                        for box in r.boxes:
                            conf = float(box.conf[0])
                            cls_id = int(box.cls[0])
                            cls_name = r.names.get(cls_id, f"class_{cls_id}")
                            
                            # Tile pixel coords [x1, y1, x2, y2]
                            xyxy_tile = box.xyxy[0].tolist()
                            
                            # Shift to full image pixel coords
                            x1_full = xyxy_tile[0] + x_off
                            y1_full = xyxy_tile[1] + y_off
                            x2_full = xyxy_tile[2] + x_off
                            y2_full = xyxy_tile[3] + y_off
                            
                            candidates.append({
                                "cls_name": cls_name,
                                "conf": conf,
                                "box_xyxy": [x1_full, y1_full, x2_full, y2_full]
                            })
        else:
            # Single tile image <= 640x640
            results = self._model(processed_bgr, conf=confidence_threshold, verbose=False)
            for r in results:
                for box in r.boxes:
                    conf = float(box.conf[0])
                    cls_id = int(box.cls[0])
                    cls_name = r.names.get(cls_id, f"class_{cls_id}")
                    xyxy_full = box.xyxy[0].tolist()
                    candidates.append({
                        "cls_name": cls_name,
                        "conf": conf,
                        "box_xyxy": xyxy_full
                    })

        if not candidates:
            return []

        # Group candidates by class and apply NMS to merge border overlapping boxes
        merged_candidates = []
        by_class = {}
        for cand in candidates:
            by_class.setdefault(cand["cls_name"], []).append(cand)

        for cls_name, cls_cands in by_class.items():
            boxes = [c["box_xyxy"] for c in cls_cands]
            scores = [c["conf"] for c in cls_cands]
            keep_indices = nms_boxes(boxes, scores, iou_threshold=0.45)
            for idx in keep_indices:
                merged_candidates.append(cls_cands[idx])

        detections = []
        for cand in merged_candidates:
            cls_name = cand["cls_name"]
            conf = cand["conf"]
            x1, y1, x2, y2 = cand["box_xyxy"]

            # Convert to normalized full image [x_center, y_center, width, height]
            bw = (x2 - x1) / img_w
            bh = (y2 - y1) / img_h
            xc = (x1 + x2) / (2.0 * img_w)
            yc = (y1 + y2) / (2.0 * img_h)
            xywh = [round(xc, 4), round(yc, 4), round(bw, 4), round(bh, 4)]

            # Geographic displacement offset (Estimated position)
            lat_offset = (yc - 0.5) * 0.008
            lon_offset = (xc - 0.5) * 0.008
            
            lat = round(start_lat + lat_offset, 6)
            lon = round(start_lon + lon_offset, 6)

            risk_score, risk_level = calculate_risk(cls_name, conf, xywh)

            detections.append({
                "class_name": cls_name,
                "confidence": round(conf, 3),
                "bbox": xywh,
                "lat": lat,
                "lon": lon,
                "position_type": "Estimated",
                "risk_score": risk_score,
                "risk_level": risk_level,
                "status": "pending"
            })

        return detections




class MockDetector(DetectorService):
    @property
    def is_mock(self) -> bool:
        return True

    def detect(self, image_bytes: bytes, confidence_threshold: float, start_lat: float, start_lon: float) -> List[Dict[str, Any]]:
        """
        Deterministic mock detector producing high-fidelity realistic sonar debris detections
        geo-tagged around the survey's starting position.
        """
        classes = ["ghost_net_fishing_gear", "shipwreck", "debris_object", "anomaly"]
        
        # Deterministic preset bounding box locations on sonar waterfall canvas
        preset_configs = [
            {"cls": "ghost_net_fishing_gear", "conf": 0.88, "bbox": [0.24, 0.35, 0.18, 0.14], "dlat": 0.0018, "dlon": -0.0024},
            {"cls": "shipwreck", "conf": 0.94, "bbox": [0.65, 0.22, 0.25, 0.20], "dlat": -0.0035, "dlon": 0.0041},
            {"cls": "debris_object", "conf": 0.76, "bbox": [0.42, 0.68, 0.12, 0.10], "dlat": 0.0042, "dlon": 0.0019},
            {"cls": "anomaly", "conf": 0.62, "bbox": [0.15, 0.78, 0.10, 0.09], "dlat": -0.0012, "dlon": -0.0038},
            {"cls": "ghost_net_fishing_gear", "conf": 0.81, "bbox": [0.78, 0.58, 0.16, 0.12], "dlat": 0.0029, "dlon": 0.0055},
            {"cls": "debris_object", "conf": 0.54, "bbox": [0.51, 0.44, 0.08, 0.08], "dlat": -0.0021, "dlon": -0.0015},
        ]
        
        detections = []
        for config in preset_configs:
            if config["conf"] >= confidence_threshold:
                lat = round(start_lat + config["dlat"], 6)
                lon = round(start_lon + config["dlon"], 6)
                
                risk_score, risk_level = calculate_risk(config["cls"], config["conf"], config["bbox"])
                
                detections.append({
                    "class_name": config["cls"],
                    "confidence": config["conf"],
                    "bbox": config["bbox"],
                    "lat": lat,
                    "lon": lon,
                    "risk_score": risk_score,
                    "risk_level": risk_level,
                    "status": "pending"
                })
                
        return detections


def get_detector() -> DetectorService:
    mode = settings.DETECTOR_MODE.lower()
    weights_path = settings.YOLO_MODEL_PATH
    
    if mode == "yolo":
        if os.path.exists(weights_path):
            return YoloDetector(weights_path)
        else:
            print(f"[DetectorService] Warning: DETECTOR_MODE=yolo but weights file '{weights_path}' not found. Falling back to MockDetector.")
            return MockDetector()
    elif mode == "auto":
        if os.path.exists(weights_path):
            print(f"[DetectorService] Found weights file at {weights_path}. Using YoloDetector.")
            return YoloDetector(weights_path)
        else:
            print(f"[DetectorService] No YOLO weights file found at {weights_path}. Operating in MockDetector (Demo Mode).")
            return MockDetector()
    else:
        return MockDetector()
