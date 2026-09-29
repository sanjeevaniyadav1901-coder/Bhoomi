import os
import pickle
import random
import numpy as np

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, "models")

CROP_MODEL_PATH = os.path.join(MODELS_DIR, "bhoomi_crop_model.pkl")
FEATURES_PATH = os.path.join(MODELS_DIR, "model_features.pkl")


class CropRecommendationService:
    def __init__(self):
        self.model = None
        self.features = None
        self.loaded = False
        self.load_model()

    def load_model(self):
        """Load crop recommendation model from models/"""
        try:
            if os.path.exists(CROP_MODEL_PATH):
                with open(CROP_MODEL_PATH, 'rb') as f:
                    self.model = pickle.load(f)
                print(f"✅ Crop recommendation model loaded")

            if os.path.exists(FEATURES_PATH):
                with open(FEATURES_PATH, 'rb') as f:
                    self.features = pickle.load(f)
                print(f"✅ Features loaded: {self.features}")

            self.loaded = self.model is not None
            return self.loaded
        except Exception as e:
            print(f"❌ Error loading crop model: {e}")
            return False

    def recommend(self, soil_data):
        """Recommend crop based on soil data"""
        if not self.loaded:
            return self._mock_recommendation()

        try:
            # Build feature array in order
            feature_values = []
            for feat in self.features:
                value = soil_data.get(feat)
                if value is None:
                    # Try lowercase
                    value = soil_data.get(feat.lower(), 0)
                feature_values.append(float(value))

            X = np.array([feature_values])
            prediction = self.model.predict(X)[0]

            confidence = 0.0
            if hasattr(self.model, 'predict_proba'):
                proba = self.model.predict_proba(X)[0]
                confidence = float(np.max(proba)) * 100

            return {
                "recommended_crop": prediction,
                "confidence": round(confidence, 2),
                "model_used": "ML"
            }
        except Exception as e:
            print(f"Crop prediction error: {e}")
            return self._mock_recommendation()

    def _mock_recommendation(self):
        crops = ["Wheat", "Rice", "Maize", "Cotton", "Sugarcane", "Bajra"]
        return {
            "recommended_crop": random.choice(crops),
            "confidence": round(random.uniform(70, 90), 2),
            "model_used": "Mock"
        }


# Singleton
crop_recommendation_service = CropRecommendationService()