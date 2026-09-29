import os
import json
import io
import random
import numpy as np
from PIL import Image

# Try to import TensorFlow
try:
    import tensorflow as tf
    TF_AVAILABLE = True
except ImportError:
    TF_AVAILABLE = False
    print("⚠️ TensorFlow not available. Using mock predictions.")

# ============================================================
# PATHS - Load models from ../models/
# ============================================================

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, "models")

MODEL_PATH = os.path.join(MODELS_DIR, "crop_disease_model.keras")
CLASS_PATH = os.path.join(MODELS_DIR, "classes.json")


class CropHealthService:
    def __init__(self):
        self.model = None
        self.class_names = []
        self.loaded = False
        self.load_model()

    def load_model(self):
        """Load disease model from models/ folder"""
        if not TF_AVAILABLE:
            print("⚠️ TensorFlow not available - mock mode enabled")
            return False

        try:
            # Load class names
            if os.path.exists(CLASS_PATH):
                with open(CLASS_PATH, 'r', encoding='utf-8') as f:
                    self.class_names = json.load(f)
                print(f"✅ Loaded {len(self.class_names)} disease classes")
            else:
                self.class_names = ["Healthy", "Bacterial Blight", "Powdery Mildew",
                                    "Rust", "Leaf Spot", "Wilt"]
                print(f"⚠️ {CLASS_PATH} not found. Using default classes.")

            # Load model
            if os.path.exists(MODEL_PATH):
                self.model = tf.keras.models.load_model(MODEL_PATH)
                self.loaded = True
                print(f"✅ Disease model loaded from {MODEL_PATH}")
            else:
                print(f"⚠️ Model not found at {MODEL_PATH}")
                print(f"   Run 'python training/train_disease_model.py' to train")

            return self.loaded
        except Exception as e:
            print(f"❌ Error loading disease model: {e}")
            return False

    def _preprocess(self, image_file, size=(224, 224)):
        """Preprocess image for model input"""
        try:
            if hasattr(image_file, 'read'):
                bytes_data = image_file.read()
                image_file.seek(0)
                img = Image.open(io.BytesIO(bytes_data))
            else:
                img = Image.open(image_file)

            img = img.convert('RGB').resize(size)
            arr = np.array(img, dtype=np.float32)
            return np.expand_dims(arr, axis=0)
        except Exception as e:
            print(f"Preprocess error: {e}")
            return None

    def detect_disease(self, image_file=None):
        """Detect disease from image using ML model"""
        if not self.loaded or image_file is None:
            return self._mock_prediction()

        try:
            arr = self._preprocess(image_file)
            if arr is None:
                return self._mock_prediction()

            preds = self.model.predict(arr, verbose=0)
            idx = int(np.argmax(preds[0]))
            confidence = float(np.max(preds[0])) * 100
            disease = self.class_names[idx]

            severity = ("low" if disease.lower() == "healthy"
                        else "high" if "blight" in disease.lower() or "wilt" in disease.lower()
                        else "medium")

            return {
                "disease": disease,
                "confidence": round(confidence, 2),
                "severity": severity,
                "nutrient_deficiency": None,
                "model_used": "ML",
                "all_predictions": {
                    self.class_names[i]: round(float(preds[0][i]) * 100, 2)
                    for i in range(len(self.class_names))
                }
            }
        except Exception as e:
            print(f"Prediction error: {e}")
            return self._mock_prediction()

    def analyze_growth_stage(self, image_file=None):
        """Analyze growth stage (mock)"""
        stages = ["Germination", "Vegetative", "Flowering", "Maturity", "Harvest"]
        return {
            "stage": random.choice(stages),
            "progress": random.randint(20, 90)
        }

    def _mock_prediction(self):
        """Mock fallback when model not available"""
        diseases = ["Healthy", "Bacterial Blight", "Powdery Mildew", "Rust", "Leaf Spot", "Wilt"]
        detected = random.choice(diseases)
        return {
            "disease": detected,
            "confidence": round(random.uniform(75, 98), 2),
            "severity": random.choice(["low", "medium", "high"]),
            "nutrient_deficiency": random.choice([None, "Nitrogen", "Phosphorus"]),
            "model_used": "Mock"
        }


# Singleton instance
crop_health_service = CropHealthService()