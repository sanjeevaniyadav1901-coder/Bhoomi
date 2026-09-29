from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# ============================================
# YOUR ORIGINAL MODEL (UNCHANGED LOGIC)
# ============================================

def recommend_crop_and_fertilizer(row):

    crops = []
    fertilizers = []
    soil_advice = []

    pH = row['pH']
    EC = row['EC']
    OC = row['Organic Carbon (%)']

    N = row['Nitrogen (kg/ha)']
    P = row['Phosphorous (kg/ha)']
    K = row['Potassium (kg/ha)']

    S = row['Sulphur (ppm)']
    Zn = row['Zinc (ppm)']
    B = row['Boron (ppm)']
    Fe = row['Iron (ppm)']
    Mn = row['Manganese (ppm)']
    Cu = row['Copper (ppm)']

    # ====================================
    # DRYLAND CROPS
    # ====================================

    if 6.0 <= pH <= 9.0:
        crops.append("Bajra")

    if 6.5 <= pH <= 9.0:
        crops.append("Jowar")

    if 6.0 <= pH <= 8.8:
        crops.append("Sunflower")

    if 6.0 <= pH <= 8.5:
        crops.append("Gram")

    # FIELD CROPS
    if 6.0 <= pH <= 8.0 and N >= 100 and P >= 40:
        crops.append("Wheat")

    if 5.5 <= pH <= 8.0 and N >= 120 and P >= 50:
        crops.append("Maize")

    # CASH CROPS
    if 6.5 <= pH <= 8.2 and N >= 150 and K >= 150 and Zn >= 0.8 and Fe >= 4:
        crops.append("Grapes")

    if 6.5 <= pH <= 8.5 and N >= 200 and K >= 150:
        crops.append("Sugarcane")

    if 5.5 <= pH <= 8.0 and OC >= 0.5 and EC < 1.5 and Zn >= 0.6:
        crops.append("Dragon Fruit")

    if len(crops) == 0:
        crops.append("Bajra")

    # ====================================
    # FERTILIZERS (UNCHANGED)
    # ====================================

    if N < 280:
        fertilizers.append("Urea")

    if P < 22:
        fertilizers.append("DAP")

    if K < 110:
        fertilizers.append("MOP")

    if S < 10:
        fertilizers.append("Gypsum")

    if Zn < 0.6:
        fertilizers.append("Zinc Sulphate")

    if B < 0.5:
        fertilizers.append("Boron")

    if Fe < 4:
        fertilizers.append("Ferrous Sulphate")

    if Mn < 2:
        fertilizers.append("Manganese Sulphate")

    if Cu < 0.2:
        fertilizers.append("Copper Sulphate")

    if OC < 0.5:
        fertilizers.append("Farmyard Manure")

    if len(fertilizers) == 0:
        fertilizers.append("Balanced NPK")

    if len(soil_advice) == 0:
        soil_advice.append("Maintain Regular Soil Testing")

    return {
        "crops": list(set(crops)),
        "fertilizers": list(set(fertilizers)),
        "soil_advice": list(set(soil_advice))
    }

# ============================================
# API ENDPOINT (ONLY ADDITION)
# ============================================

@app.route("/predict", methods=["POST"])
def predict():

    data = request.json

    # IMPORTANT: safe mapping (React → Python format)
    formatted_input = {
        "pH": data.get("ph", 7),
        "EC": data.get("ec", 1),
        "Organic Carbon (%)": data.get("organic_carbon", 0.5),
        "Nitrogen (kg/ha)": data.get("nitrogen", 100),
        "Phosphorous (kg/ha)": data.get("phosphorus", 40),
        "Potassium (kg/ha)": data.get("potassium", 110),
        "Sulphur (ppm)": data.get("sulphur", 10),
        "Zinc (ppm)": data.get("zinc", 0.6),
        "Boron (ppm)": data.get("boron", 0.5),
        "Iron (ppm)": data.get("iron", 4),
        "Manganese (ppm)": data.get("manganese", 2),
        "Copper (ppm)": data.get("copper", 0.2),
    }

    result = recommend_crop_and_fertilizer(formatted_input)

    return jsonify(result)



# ============================================
# RUN SERVER
# ============================================

if __name__ == "__main__":
    app.run(debug=True)