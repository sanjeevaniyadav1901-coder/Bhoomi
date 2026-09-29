import pandas as pd
import numpy as np
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

print("\n📥 Loading dataset...\n")


# STEP 1 — Load Dataset


df = pd.read_csv(r"C:\Users\sanje\OneDrive\Desktop\bhoomidata_supervised_ICAR1.csv")

print("✅ Dataset Loaded Successfully")


# STEP 2 — FILTER ONLY REQUIRED CROPS


allowed_crops = [
    "Jowar",
    "Wheat",
    "Bajra",
    "Grapes",
    "Maize",
    "Sugarcane",
    "Gram",
    "Dragon Fruit",
    "Pomegranate"
]

df = df[df['Recommended Crop 1'].isin(allowed_crops)]

print("\n✅ Dataset filtered")
print("🌾 Available crops:", df['Recommended Crop 1'].unique())


# STEP 3 — Feature Selection


FEATURE_COLUMNS = [
    'pH',
    'Nitrogen (kg/ha)',
    'Phosphorous (kg/ha)',
    'Potassium (kg/ha)',
    'Organic Carbon (%)'
]

TARGET_COLUMN = 'Recommended Crop 1'

X = df[FEATURE_COLUMNS]
y = df[TARGET_COLUMN]


# STEP 4 — Train/Test Split


X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.20,
    random_state=42
)

print("\n📌 Training Data:", len(X_train))
print("📌 Testing Data:", len(X_test))


# STEP 5 — Train Model


print("\n🤖 Training model...\n")

model = RandomForestClassifier(
    n_estimators=150,
    random_state=42
)

model.fit(X_train, y_train)

print("✅ Model Training Completed")


# STEP 6 — Evaluate Model


y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)

print("\n🎯 Accuracy:", round(accuracy * 100, 2), "%")


# STEP 7 — Save Model


joblib.dump(model, "bhoomi_crop_model.pkl")
joblib.dump(FEATURE_COLUMNS, "model_features.pkl")

print("\n💾 Model saved successfully")


#  STEP 8 — Prediction Function (API READY)


def predict_crop(sensor_data, selected_crops=None):

    input_df = pd.DataFrame([[
        sensor_data["pH"],
        sensor_data["N"],
        sensor_data["P"],
        sensor_data["K"],
        sensor_data["OC"]
    ]], columns=FEATURE_COLUMNS)

    probs = model.predict_proba(input_df)[0]
    crop_names = model.classes_

    crop_prob_dict = dict(zip(crop_names, probs))

    # 🎯 Best overall crop
    best_crop = max(crop_prob_dict, key=crop_prob_dict.get)

    # 🌾 Farmer filtered crop
    filtered_crop = None

    if selected_crops:
        filtered_crop = max(
            selected_crops,
            key=lambda crop: crop_prob_dict.get(crop, 0)
        )

    return {
        "best_crop": best_crop,
        "filtered_crop": filtered_crop,
        "probabilities": {
            crop: round(prob * 100, 2)
            for crop, prob in crop_prob_dict.items()
        }
    }


# 🧪 STEP 9 — TEST WITH SAMPLE DATA


print("\n🧪 Testing with Sample Sensor Data...\n")

sample_sensor = {
    "pH": 6.5,
    "N": 120,
    "P": 55,
    "K": 45,
    "OC": 0.6
}

selected = ["Wheat", "Maize", "Jowar"]

result = predict_crop(sample_sensor, selected)

print("🌾 Best Crop:", result["best_crop"])
print("🌱 Best Among Selected:", result["filtered_crop"])

print("\n📊 Probabilities:")
for crop, prob in result["probabilities"].items():
    print(f"{crop}: {prob}%")