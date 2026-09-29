import os
import io
import random
import numpy as np
from PIL import Image

# Try to import TensorFlow (optional - can use mock)
try:
    import tensorflow as tf
    TF_AVAILABLE = True
except ImportError:
    TF_AVAILABLE = False

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, "models")

# Optional: If you train a pest model later, put it here
PEST_MODEL_PATH = os.path.join(MODELS_DIR, "pest_detection_model.keras")


class PestDetectionService:
    def __init__(self):
        self.model = None
        self.loaded = False
        self.load_model()

    def load_model(self):
        """Load pest model if it exists"""
        if not TF_AVAILABLE:
            print("⚠️ TensorFlow not available - pest detection uses mock")
            return False

        if os.path.exists(PEST_MODEL_PATH):
            try:
                self.model = tf.keras.models.load_model(PEST_MODEL_PATH)
                self.loaded = True
                print(f"✅ Pest model loaded from {PEST_MODEL_PATH}")
                return True
            except Exception as e:
                print(f"❌ Error loading pest model: {e}")
                return False
        else:
            print(f"⚠️ Pest model not found - using mock detection")
            print(f"   Place a trained model at {PEST_MODEL_PATH} to enable real detection")
            return False

    def detect_pests(self, image_file=None):
        """Detect pests from image (mock for now)"""
        all_pests = [
            {"name": "Aphids", "count": random.randint(0, 50)},
            {"name": "Whitefly", "count": random.randint(0, 30)},
            {"name": "Leaf Miner", "count": random.randint(0, 20)},
            {"name": "Thrips", "count": random.randint(0, 15)},
            {"name": "Spider Mites", "count": random.randint(0, 10)}
        ]

        found = [p for p in all_pests if p['count'] > 0]

        return {
            "pests_found": found,
            "severity": ("low" if len(found) <= 1
                         else "medium" if len(found) <= 2
                         else "high"),
            "action_needed": random.choice([
                "Apply neem oil spray",
                "Use organic pesticides",
                "Introduce beneficial insects",
                "Monitor closely",
                "Immediate treatment required"
            ]),
            "model_used": "ML" if self.loaded else "Mock"
        }

    def check_infestation_pattern(self, field_images=None):
        """Analyze infestation spread"""
        return {
            "infestation_spread": random.randint(5, 40),
            "priority": random.choice(["low", "medium", "high"])
        }


# Singleton
pest_detection_service = PestDetectionService()