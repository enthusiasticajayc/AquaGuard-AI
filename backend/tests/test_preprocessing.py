import os
import unittest
import numpy as np
import cv2
from backend.services.preprocessing import preprocess_sonar_image

class TestSonarPreprocessing(unittest.TestCase):
    def setUp(self):
        # Create a synthetic 100x100 grayscale image as raw bytes
        img = np.random.randint(20, 200, (100, 100, 3), dtype=np.uint8)
        _, encoded = cv2.imencode('.jpg', img)
        self.raw_bytes = encoded.tobytes()

    def test_preprocessing_runs_on_raw_upload(self):
        """Test that preprocessing transforms raw image bytes when already_preprocessed=False."""
        processed_bytes = preprocess_sonar_image(self.raw_bytes, already_preprocessed=False)
        self.assertIsNotNone(processed_bytes)
        self.assertNotEqual(self.raw_bytes, processed_bytes, "Processed bytes should differ from raw input bytes when CLAHE is applied.")

    def test_preprocessing_skipped_when_already_preprocessed(self):
        """Test that preprocessing is skipped exactly when already_preprocessed=True."""
        processed_bytes = preprocess_sonar_image(self.raw_bytes, already_preprocessed=True)
        self.assertEqual(self.raw_bytes, processed_bytes, "Raw input bytes should be returned unchanged when already_preprocessed=True.")

if __name__ == '__main__':
    unittest.main()
