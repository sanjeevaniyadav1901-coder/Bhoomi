import pandas as pd
import joblib

# -----------------------------
# Load Model
# -----------------------------
kmeans = joblib.load("kmeans_model.pkl")
scaler = joblib.load("scaler.pkl")
features = joblib.load("features.pkl")

# -----------------------------
# Logic Functions
# -----------------------------
def soil_health(cluster):
    return ["Good","Medium","Poor"][cluster]

# 🔥 UPDATED CROP LOGIC (8 CROPS)
def crop(cluster, row):

    pH = row.get('pH', 7)
    N = row.get('Nitrogen (kg/ha)', 0)
    P = row.get('Phosphorous (kg/ha)', 0)
    K = row.get('Potassium (kg/ha)', 0)

    # Good soil (rich nutrients)
    if cluster == 0:
        if K > 200:
            return "Grapes"
        elif pH > 6.5:
            return "Pomegranate"
        else:
            return "Sugarcane"

    # Medium soil
    elif cluster == 1:
        if N > 200:
            return "Maize"
        elif pH < 6.5:
            return "Wheat"
        else:
            return "Dragon Fruit"

    # Poor soil
    else:
        if N < 150:
            return "Bajra"
        else:
            return "Jowar"

# -----------------------------
# Fertilizer Recommendation
# -----------------------------
def fertilizer(row):
    rec = []

    if row.get('Nitrogen (kg/ha)', 0) < 280:
        rec.append("Add Urea")
    if row.get('Phosphorous (kg/ha)', 0) < 20:
        rec.append("Add DAP")
    if row.get('Potassium (kg/ha)', 0) < 150:
        rec.append("Add Potash")
    if row.get('Zinc (ppm)', 0) < 0.6:
        rec.append("Add Zinc")
    if row.get('Iron (ppm)', 0) < 4:
        rec.append("Add Iron")

    if not rec:
        return "No fertilizer needed"

    return ", ".join(rec)

# -----------------------------
# Yield Estimation
# -----------------------------
def yield_prediction(row):
    N = row.get('Nitrogen (kg/ha)', 0)
    P = row.get('Phosphorous (kg/ha)', 0)
    K = row.get('Potassium (kg/ha)', 0)
    OC = row.get('Organic Carbon (%)', 0)

    # improved formula
    return round((0.4*N + 0.3*P + 0.2*K + 50*OC)/10, 2)

# -----------------------------
# New Input
# -----------------------------
new_input = {
    'Area':0.4,
    'pH':6.5,
    'EC':0.3,
    'Organic Carbon (%)':0.7,
    'Nitrogen (kg/ha)':250,
    'Phosphorous (kg/ha)':25,
    'Potassium (kg/ha)':200,
    'Sulphur (ppm)':12,
    'Zinc (ppm)':0.7,
    'Boron (ppm)':0.5,
    'Iron (ppm)':5,
    'Manganese (ppm)':2,
    'Copper (ppm)':1
}

# -----------------------------
# Convert to DataFrame
# -----------------------------
df = pd.DataFrame([new_input])
df = df[features]

# -----------------------------
# Scale Input
# -----------------------------
scaled = scaler.transform(df)

# -----------------------------
# Predict Cluster
# -----------------------------
cluster = kmeans.predict(scaled)[0]

# -----------------------------
# Final Output
# -----------------------------
print("\n🔍 FINAL PREDICTION:")

print("Soil Health:", soil_health(cluster))
print("Recommended Crop:", crop(cluster, df.iloc[0]))
print("Fertilizer:", fertilizer(df.iloc[0]))
print("Estimated Yield:", yield_prediction(df.iloc[0]))