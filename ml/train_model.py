# -----------------------------
# 1. Import Libraries
# -----------------------------
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
import joblib

# -----------------------------
# 2. Load Dataset
# -----------------------------
df = pd.read_csv("C:/Users/sanje/OneDrive/Desktop/bhoomidata.csv")

# -----------------------------
# 3. Clean Columns
# -----------------------------
df.columns = df.columns.str.strip()
df = df.drop(columns=['Sr. No.', 'Sample No.', 'Farmer Name'], errors='ignore')

# -----------------------------
# 4. Convert to Numeric
# -----------------------------
for col in df.columns:
    df[col] = pd.to_numeric(df[col], errors='coerce')

# Fill missing values
df = df.fillna(df.mean(numeric_only=True))

# -----------------------------
# 5. Feature Selection
# -----------------------------
features = [
    'Area','pH','EC','Organic Carbon (%)',
    'Nitrogen (kg/ha)','Phosphorous (kg/ha)','Potassium (kg/ha)',
    'Sulphur (ppm)','Zinc (ppm)','Boron (ppm)',
    'Iron (ppm)','Manganese (ppm)','Copper (ppm)'
]

# Keep only available columns
features = [col for col in features if col in df.columns]
X = df[features]

# -----------------------------
# 6. Scaling
# -----------------------------
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# -----------------------------
# 7. Train KMeans
# -----------------------------
kmeans = KMeans(n_clusters=4, random_state=0)
kmeans.fit(X_scaled)

# -----------------------------
# 8. Cluster Analysis (VERY IMPORTANT 🔥)
# -----------------------------
df['Cluster'] = kmeans.predict(X_scaled)

print("\n🔍 Cluster Analysis:\n")
print(df.groupby('Cluster').mean())

# -----------------------------
# 9. Save Model
# -----------------------------
joblib.dump(kmeans, "kmeans_model.pkl")
joblib.dump(scaler, "scaler.pkl")
joblib.dump(features, "features.pkl")

print("\n✅ Model Trained & Saved Successfully")