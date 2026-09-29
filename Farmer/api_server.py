from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
from datetime import datetime
import numpy as np
import joblib

# ================= LOAD ML MODEL (kept but not used now) =================
model = joblib.load("bhoomi_crop_model.pkl")

# ================= DATABASE =================
from database import FarmDatabase
db = FarmDatabase()

# ================= FIREBASE (NEW) =================
import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)
fdb = firestore.client()

# ================= APP =================
app = Flask(__name__)
CORS(app)

API_KEY = "YOUR_API_KEY"

# ================= AUTH STORAGE =================
users = {}

# ================= GLOBAL SENSOR STORAGE =================
latest_data = {
    "temperature": 0,
    "humidity": 0,
    "soilPercent": 0,
    "tds": 0,
    "ph": 7.0,
    "n": 0,
    "p": 0,
    "k": 0,
    "motor": 0,
    "time": "--:--:--"
}

# ================= AUTH APIs =================

@app.route("/register", methods=["POST"])
def register():
    try:
        data = request.get_json()

        email = data.get("email")
        password = data.get("password")
        name = data.get("name")

        if not email or not password or not name:
            return jsonify({"message": "Missing fields"}), 400

        if email in users:
            return jsonify({"message": "User already exists"}), 400

        users[email] = {
            "password": password,
            "name": name
        }

        return jsonify({"message": "Registered successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()

        email = data.get("email")
        password = data.get("password")

        user = users.get(email)

        if not user or user["password"] != password:
            return jsonify({"message": "Invalid email or password"}), 401

        return jsonify({
            "message": "Login successful",
            "name": user["name"]
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ================= WEATHER =================

@app.route("/weather/<city>")
def get_weather(city):
    try:
        existing = db.get_weather_by_city(city)

        if existing:
            return jsonify({
                "temperature": existing[0],
                "humidity": existing[1],
                "windSpeed": existing[2],
                "rainfall": existing[3],
                "rainProbability": existing[4],
                "condition": existing[5]
            })

        url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}&units=metric"
        response = requests.get(url)
        data = response.json()

        if "main" not in data:
            return jsonify({"error": "City not found"}), 404

        temperature = data["main"]["temp"]
        humidity = data["main"]["humidity"]
        windSpeed = data["wind"]["speed"]
        rainfall = data.get("rain", {}).get("1h", 0)
        rainProbability = data.get("clouds", {}).get("all", 0)
        condition = data["weather"][0]["description"]

        db.save_weather(city, temperature, humidity, windSpeed,
                        rainfall, rainProbability, condition)

        return jsonify({
            "temperature": temperature,
            "humidity": humidity,
            "windSpeed": windSpeed,
            "rainfall": rainfall,
            "rainProbability": rainProbability,
            "condition": condition
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ================= RECEIVE ESP DATA =================

@app.route("/api/data", methods=["POST"])
def receive_esp_data():
    global latest_data

    try:
        data = request.get_json()

        latest_data.update({
            "temperature": data.get("temperature", 0),
            "humidity": data.get("humidity", 0),
            "soilPercent": data.get("soilPercent", 0),
            "tds": data.get("tds", 0),
            "ph": data.get("ph", 7.0),
            "n": data.get("n", 0),
            "p": data.get("p", 0),
            "k": data.get("k", 0),
            "motor": data.get("motor", 0),
            "time": datetime.now().strftime("%H:%M:%S")
        })

        # ================= FIREBASE (NEW): persist latest snapshot + history =================
        try:
            farm_id = data.get("farm_id", "farm-1")

            fdb.collection("farms").document(farm_id).set(latest_data, merge=True)

            fdb.collection("farms").document(farm_id) \
                .collection("sensor_history") \
                .add({**latest_data, "timestamp": datetime.utcnow().isoformat()})
        except Exception as fb_err:
            print("Firebase save error (sensor data):", fb_err)

        return jsonify({"message": "ESP data received"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ================= SEND DATA TO FRONTEND =================

@app.route("/api/data", methods=["GET"])
def send_esp_data():
    global latest_data

    try:
        ec_value = latest_data.get("tds", 0) / 500.0

        return jsonify({
            "moisture": latest_data.get("soilPercent", 0),
            "humidity": latest_data.get("humidity", 0),
            "temperature": latest_data.get("temperature", 0),
            "nitrogen": latest_data.get("n", 0),
            "phosphorus": latest_data.get("p", 0),
            "potassium": latest_data.get("k", 0),
            "ph": latest_data.get("ph", 7.0),
            "ec": round(ec_value, 2)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ================= SMART LOGIC =================

def estimate_missing_values(N, P, K):
    OC = 0.6 if N > 100 else 0.4
    S = 10 if P > 40 else 6
    Zn = 0.7
    B = 0.5
    Fe = 5
    Mn = 3
    Cu = 0.3
    return OC, S, Zn, B, Fe, Mn, Cu


def full_soil_recommendation(pH, EC, OC, N, P, K, S, Zn, B, Fe, Mn, Cu):

    scores = {
        "Jowar": 0,
        "Wheat": 0,
        "Bajra": 0,
        "Grapes": 0,
        "Maize": 0,
        "Sugarcane": 0,
        "Gram": 0,
        "Dragon Fruit": 0,
        "Pomegranate": 0
    }

    fertilizers = []

    if 6.0 <= pH <= 7.5:
        scores["Wheat"] += 3
        scores["Maize"] += 3
    elif pH > 7.5:
        scores["Bajra"] += 4
        fertilizers.append("Gypsum")

    if EC > 2:
        fertilizers.append("Leaching")

    if OC < 0.5:
        fertilizers.append("Compost")

    if N < 120:
        fertilizers.append("Urea")
    if P < 50:
        fertilizers.append("DAP")
    if K < 50:
        fertilizers.append("MOP")

    best_crop = max(scores, key=scores.get)

    if not fertilizers:
        fertilizers.append("Balanced NPK")

    return best_crop, " + ".join(set(fertilizers))


# ================= PREDICTION API =================

@app.route("/api/predict", methods=["GET"])
def get_prediction():
    global latest_data

    try:
        N = latest_data.get("n", 0)
        P = latest_data.get("p", 0)
        K = latest_data.get("k", 0)
        pH = latest_data.get("ph", 7.0)

        EC = latest_data.get("tds", 0) / 500.0

        OC, S, Zn, B, Fe, Mn, Cu = estimate_missing_values(N, P, K)

        crop, fertilizer = full_soil_recommendation(
            pH, EC, OC, N, P, K, S, Zn, B, Fe, Mn, Cu
        )

        result = {
            "recommended_crop": crop,
            "fertilizer": fertilizer,
            "time": latest_data.get("time")
        }

        # ================= FIREBASE (NEW): save prediction history =================
        try:
            farm_id = request.args.get("farm_id", "farm-1")
            fdb.collection("farms").document(farm_id).collection("predictions").add({
                **result,
                "timestamp": datetime.utcnow().isoformat(),
            })
        except Exception as fb_err:
            print("Firebase save error (prediction):", fb_err)

        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ================= FIREBASE TEST (NEW) =================

@app.route("/api/firebase-test", methods=["GET"])
def firebase_test():
    try:
        fdb.collection("test").document("ping").set({"status": "connected"})
        return jsonify({"success": True, "message": "Firebase connected!"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ================= RUN =================

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)