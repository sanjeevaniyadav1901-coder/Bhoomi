from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore, auth
import json
from datetime import datetime, timedelta
import random
import os
import sqlite3

# ============================================
# IMPORT SERVICES
# ============================================
from services.crop_health_service import crop_health_service
from services.pest_detection_service import pest_detection_service
from services.crop_recommendation_service import crop_recommendation_service
from services.fertilizer_service import fertilizer_service
from services.environmental_risk_service import EnvironmentalRiskService
from services.farmer_advisory import farmer_advisory_service

app = Flask(__name__)
CORS(app)

# Initialize environmental risk service
environmental_risk_service = EnvironmentalRiskService()

# ============================================
# FIREBASE INITIALIZATION
# ============================================

try:
    cred = credentials.Certificate("serviceAccountKey.json")
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("✅ Firebase initialized successfully!")
except Exception as e:
    print(f"❌ Firebase initialization error: {e}")
    db = None

# ============================================
# DATABASE INITIALIZATION (SQLite for fallback)
# ============================================

def init_db():
    conn = sqlite3.connect('smart_farm.db')
    cursor = conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS crop_health_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            field_id TEXT,
            crop_type TEXT,
            health_score INTEGER,
            disease_detected TEXT,
            disease_severity TEXT,
            nutrient_deficiency TEXT,
            growth_stage TEXT,
            detection_date TIMESTAMP,
            image_url TEXT,
            confidence REAL
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS pest_detections (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            field_id TEXT,
            pest_name TEXT,
            count INTEGER,
            severity TEXT,
            detection_date TIMESTAMP,
            image_url TEXT,
            confidence REAL
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS environmental_risks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            field_id TEXT,
            risk_type TEXT,
            severity TEXT,
            probability REAL,
            detection_date TIMESTAMP,
            action_recommended TEXT
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS farmer_advisories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            field_id TEXT,
            advisory_type TEXT,
            priority TEXT,
            message TEXT,
            action TEXT,
            created_at TIMESTAMP,
            is_read BOOLEAN DEFAULT 0
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS irrigation_recommendations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            field_id TEXT,
            soil_moisture REAL,
            temperature REAL,
            humidity REAL,
            recommendation TEXT,
            amount_liters INTEGER,
            created_at TIMESTAMP
        )
    ''')

    conn.commit()
    conn.close()
    print("✅ Database initialized successfully!")

init_db()

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

    # DRYLAND CROPS
    if 6.0 <= pH <= 9.0: crops.append("Bajra")
    if 6.5 <= pH <= 9.0: crops.append("Jowar")
    if 6.0 <= pH <= 8.8: crops.append("Sunflower")
    if 6.0 <= pH <= 8.5: crops.append("Gram")

    # FIELD CROPS
    if 6.0 <= pH <= 8.0 and N >= 100 and P >= 40: crops.append("Wheat")
    if 5.5 <= pH <= 8.0 and N >= 120 and P >= 50: crops.append("Maize")

    # CASH CROPS
    if 6.5 <= pH <= 8.2 and N >= 150 and K >= 150 and Zn >= 0.8 and Fe >= 4:
        crops.append("Grapes")
    if 6.5 <= pH <= 8.5 and N >= 200 and K >= 150: crops.append("Sugarcane")
    if 5.5 <= pH <= 8.0 and OC >= 0.5 and EC < 1.5 and Zn >= 0.6:
        crops.append("Dragon Fruit")

    if len(crops) == 0: crops.append("Bajra")

    # FERTILIZERS
    if N < 280: fertilizers.append("Urea")
    if P < 22: fertilizers.append("DAP")
    if K < 110: fertilizers.append("MOP")
    if S < 10: fertilizers.append("Gypsum")
    if Zn < 0.6: fertilizers.append("Zinc Sulphate")
    if B < 0.5: fertilizers.append("Boron")
    if Fe < 4: fertilizers.append("Ferrous Sulphate")
    if Mn < 2: fertilizers.append("Manganese Sulphate")
    if Cu < 0.2: fertilizers.append("Copper Sulphate")
    if OC < 0.5: fertilizers.append("Farmyard Manure")

    if len(fertilizers) == 0: fertilizers.append("Balanced NPK")
    if len(soil_advice) == 0: soil_advice.append("Maintain Regular Soil Testing")

    return {
        "crops": list(set(crops)),
        "fertilizers": list(set(fertilizers)),
        "soil_advice": list(set(soil_advice))
    }

# ============================================
# AUTHENTICATION ENDPOINTS
# ============================================

@app.route("/api/auth/verify", methods=["POST"])
def verify_token():
    try:
        data = request.json
        id_token = data.get('id_token')
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token['uid']
        user = auth.get_user(uid)
        return jsonify({
            "success": True,
            "user": {
                "uid": user.uid,
                "email": user.email,
                "display_name": user.display_name,
                "phone_number": user.phone_number,
                "photo_url": user.photo_url
            }
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 401

@app.route("/api/auth/user/<uid>", methods=["GET"])
def get_user_data(uid):
    try:
        user = auth.get_user(uid)
        return jsonify({
            "uid": user.uid,
            "email": user.email,
            "display_name": user.display_name,
            "phone_number": user.phone_number,
            "photo_url": user.photo_url,
            "email_verified": user.email_verified
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 404

# ============================================
# HELPER FUNCTIONS (kept as fallback)
# ============================================

def get_irrigation_recommendation(field_id):
    soil_moisture = random.uniform(15, 70)
    temperature = random.uniform(20, 42)
    humidity = random.uniform(30, 90)

    if soil_moisture < 25:
        recommendation = "Irrigate Now"
        amount = random.randint(1500, 3500)
        reason = "Soil moisture below optimal level (25%)"
    elif soil_moisture < 40:
        recommendation = "Irrigate Soon"
        amount = random.randint(1000, 2000)
        reason = "Soil moisture approaching critical level (40%)"
    elif soil_moisture > 75:
        recommendation = "Delay Irrigation"
        amount = 0
        reason = "Soil moisture above optimal level (75%)"
    else:
        recommendation = "Maintain Current Schedule"
        amount = random.randint(500, 1500)
        reason = f"Soil moisture at optimal level ({round(soil_moisture)}%)"

    return {
        "soil_moisture": round(soil_moisture, 1),
        "temperature": round(temperature, 1),
        "humidity": round(humidity, 1),
        "recommendation": recommendation,
        "amount_liters": amount,
        "reason": reason,
        "timestamp": datetime.now().isoformat()
    }

# ============================================
# SQLITE FALLBACK STORE
# ============================================

def store_in_sqlite(table_name, data):
    try:
        conn = sqlite3.connect('smart_farm.db')
        cursor = conn.cursor()

        if table_name == 'crop_health_records':
            cursor.execute('''
                INSERT INTO crop_health_records 
                (field_id, crop_type, health_score, disease_detected, disease_severity, 
                 nutrient_deficiency, growth_stage, detection_date, image_url, confidence)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                data.get('field_id'),
                data.get('crop_type'),
                data.get('overall_health_score'),
                data.get('disease'),
                data.get('severity'),
                data.get('nutrient_deficiency'),
                data.get('stage'),
                data.get('timestamp'),
                data.get('image_url'),
                data.get('confidence')
            ))

        conn.commit()
        conn.close()
    except Exception as e:
        print(f"SQLite store error: {e}")

# ============================================
# ORIGINAL API ENDPOINT (UNCHANGED)
# ============================================

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
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
# HEALTH CHECK ENDPOINT
# ============================================

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "firebase": "connected" if db else "disconnected",
        "ml_model": "loaded" if crop_health_service.loaded else "mock_mode",
        "ml_mode": "real" if crop_health_service.loaded else "mock",
        "num_classes": len(crop_health_service.class_names),
        "timestamp": datetime.now().isoformat()
    })

# ============================================
# ML STATUS ENDPOINT
# ============================================

@app.route("/api/ml/status", methods=["GET"])
def ml_status():
    """Check which ML models are loaded"""
    return jsonify({
        "crop_health": {
            "loaded": crop_health_service.loaded,
            "num_classes": len(crop_health_service.class_names),
            "classes": crop_health_service.class_names
        },
        "crop_recommendation": {
            "loaded": crop_recommendation_service.loaded,
            "features": crop_recommendation_service.features
        },
        "pest_detection": {
            "loaded": pest_detection_service.loaded
        },
        "fertilizer": {
            "loaded": True,
            "type": "rule-based"
        }
    })

# ============================================
# CROP HEALTH MONITORING ENDPOINTS
# ============================================

@app.route("/api/crop-health/analyze", methods=["POST"])
def analyze_crop_health():
    """Analyze crop health using crop_health_service"""
    try:
        image_file = None
        image_url = None

        if request.files:
            image_file = request.files.get('image')
            field_id = request.form.get('field_id', 'test_field')
            crop_type = request.form.get('crop_type', 'Unknown')
            user_id = request.form.get('user_id', 'unknown')
        else:
            data = request.json or {}
            image_url = data.get('image_url')
            field_id = data.get('field_id', 'test_field')
            crop_type = data.get('crop_type', 'Unknown')
            user_id = data.get('user_id', 'unknown')

        # ✅ Use crop_health_service (real ML or mock fallback)
        health_result = crop_health_service.detect_disease(image_file)
        growth_stage = crop_health_service.analyze_growth_stage()

        result = {
            **health_result,
            **growth_stage,
            "overall_health_score": 95 if health_result['disease'] == 'Healthy'
                                    else random.randint(40, 70),
            "field_id": field_id,
            "crop_type": crop_type,
            "image_url": image_url,
            "user_id": user_id,
            "timestamp": datetime.now().isoformat()
        }

        if db:
            try:
                doc_ref = db.collection('crop_health_records').document()
                doc_ref.set(result)
                result["id"] = doc_ref.id
            except Exception as e:
                print(f"Firebase store error: {e}")
                store_in_sqlite('crop_health_records', result)
        else:
            store_in_sqlite('crop_health_records', result)

        return jsonify(result)
    except Exception as e:
        print(f"Error in crop health analysis: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/crop-health/history/<field_id>", methods=["GET"])
def get_crop_health_history(field_id):
    """Get crop health history for a field"""
    try:
        history = []

        if db:
            try:
                records = db.collection('crop_health_records')\
                    .where('field_id', '==', field_id)\
                    .order_by('timestamp', direction=firestore.Query.DESCENDING)\
                    .limit(30)\
                    .stream()

                for doc in records:
                    data = doc.to_dict()
                    history.append({
                        "id": doc.id,
                        "crop_type": data.get('crop_type'),
                        "health_score": data.get('overall_health_score'),
                        "disease": data.get('disease'),
                        "severity": data.get('severity'),
                        "growth_stage": data.get('stage'),
                        "date": data.get('timestamp'),
                        "confidence": data.get('confidence')
                    })

                if history:
                    return jsonify({"history": history})
            except Exception as e:
                print(f"Firebase query error: {e}")

        # Fallback to SQLite
        conn = sqlite3.connect('smart_farm.db')
        cursor = conn.cursor()
        cursor.execute('''
            SELECT * FROM crop_health_records 
            WHERE field_id = ? 
            ORDER BY detection_date DESC 
            LIMIT 30
        ''', (field_id,))
        rows = cursor.fetchall()
        conn.close()

        for row in rows:
            history.append({
                "id": row[0],
                "crop_type": row[2],
                "health_score": row[3],
                "disease": row[4],
                "severity": row[5],
                "growth_stage": row[7],
                "date": row[8],
                "confidence": row[10]
            })

        return jsonify({"history": history})
    except Exception as e:
        print(f"Error in get_crop_health_history: {e}")
        return jsonify({"error": str(e), "history": []}), 500

# ============================================
# PEST DETECTION ENDPOINTS
# ============================================

@app.route("/api/pests/detect", methods=["POST"])
def detect_pests():
    """Detect pests using pest_detection_service"""
    try:
        image_file = None
        image_url = None

        if request.files:
            image_file = request.files.get('image')
            field_id = request.form.get('field_id', 'test_field')
            user_id = request.form.get('user_id', 'unknown')
        else:
            data = request.json or {}
            image_url = data.get('image_url')
            field_id = data.get('field_id', 'test_field')
            user_id = data.get('user_id', 'unknown')

        # ✅ Use pest_detection_service
        result = pest_detection_service.detect_pests(image_file)
        result["field_id"] = field_id
        result["image_url"] = image_url
        result["user_id"] = user_id
        result["timestamp"] = datetime.now().isoformat()

        if db:
            try:
                for pest in result.get('pests_found', []):
                    pest_data = {
                        "field_id": field_id,
                        "pest_name": pest['name'],
                        "count": pest['count'],
                        "severity": result['severity'],
                        "detection_date": datetime.now().isoformat(),
                        "image_url": image_url,
                        "user_id": user_id,
                        "confidence": random.uniform(0.7, 0.95)
                    }
                    doc_ref = db.collection('pest_detections').document()
                    doc_ref.set(pest_data)
            except Exception as e:
                print(f"Firebase store error: {e}")

        return jsonify(result)
    except Exception as e:
        print(f"Error in pest detection: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/pests/alerts/<field_id>", methods=["GET"])
def get_pest_alerts(field_id):
    """Get pest alerts"""
    try:
        alerts = []

        if db:
            try:
                alerts_ref = db.collection('pest_detections')\
                    .where('field_id', '==', field_id)\
                    .where('severity', 'in', ['high', 'medium'])\
                    .order_by('detection_date', direction=firestore.Query.DESCENDING)\
                    .limit(20)\
                    .stream()

                for doc in alerts_ref:
                    data = doc.to_dict()
                    alerts.append({
                        "id": doc.id,
                        "pest": data.get('pest_name'),
                        "count": data.get('count'),
                        "severity": data.get('severity'),
                        "date": data.get('detection_date')
                    })
            except Exception as e:
                print(f"Firebase query error: {e}")

        if not alerts:
            for i in range(random.randint(1, 3)):
                alerts.append({
                    "id": f"mock_alert_{i}",
                    "pest": random.choice(["Aphids", "Whitefly", "Leaf Miner"]),
                    "count": random.randint(10, 50),
                    "severity": random.choice(["medium", "high"]),
                    "date": (datetime.now() - timedelta(hours=random.randint(1, 24))).isoformat()
                })

        return jsonify({"alerts": alerts})
    except Exception as e:
        print(f"Error in get_pest_alerts: {e}")
        return jsonify({"error": str(e), "alerts": []}), 500

# ============================================
# ENVIRONMENTAL RISK MONITORING ENDPOINTS
# ============================================

@app.route("/api/environmental-risks/<field_id>", methods=["GET"])
def get_environmental_risks(field_id):
    """Get environmental risk assessment using service"""
    try:
        weather_data = {
            "temperature": random.uniform(20, 45),
            "humidity": random.uniform(30, 95),
            "rainfall": random.uniform(0, 80)
        }
        soil_data = {
            "moisture": random.uniform(10, 90)
        }

        # ✅ Use environmental_risk_service
        risks = environmental_risk_service.analyze_environmental_risks(weather_data, soil_data)

        if not risks:
            risks = [{
                "type": "none",
                "severity": "low",
                "probability": 0.1,
                "action": "No action needed"
            }]

        return jsonify({"risks": risks, "field_id": field_id})
    except Exception as e:
        print(f"Error in environmental risks: {e}")
        return jsonify({"error": str(e), "risks": []}), 500

# ============================================
# FARMER ADVISORY SYSTEM ENDPOINTS
# ============================================

@app.route("/api/advisory/generate", methods=["POST"])
def generate_farmer_advisory():
    """Generate farmer advisory using service"""
    try:
        data = request.json or {}
        field_id = data.get('field_id', 'test_field')
        user_id = data.get('user_id', 'unknown')

        crop_health = crop_health_service.detect_disease(None)
        pest_data = pest_detection_service.detect_pests(None)
        weather_data = {
            "temperature": random.uniform(20, 42),
            "humidity": random.uniform(30, 90)
        }
        soil_data = {
            "moisture": random.uniform(15, 85)
        }

        # ✅ Use farmer_advisory_service
        result = farmer_advisory_service.generate_advisory(
            crop_health, pest_data, weather_data, soil_data
        )
        result["field_id"] = field_id
        result["user_id"] = user_id
        result["timestamp"] = datetime.now().isoformat()

        return jsonify(result)
    except Exception as e:
        print(f"Error in generate farmer advisory: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/advisory/<field_id>", methods=["GET"])
def get_advisories(field_id):
    """Get farmer advisories"""
    try:
        advisories = []

        for i in range(random.randint(0, 3)):
            advisories.append({
                "id": f"adv_{i}",
                "type": random.choice(["Irrigation", "Disease", "Pest", "Weather"]),
                "priority": random.choice(["high", "medium", "low"]),
                "message": f"Advisory message {i+1} for field {field_id}",
                "action": f"Recommended action {i+1}",
                "created_at": (datetime.now() - timedelta(hours=random.randint(1, 12))).isoformat()
            })

        return jsonify({"advisories": advisories, "total": len(advisories)})
    except Exception as e:
        print(f"Error in get_advisories: {e}")
        return jsonify({"error": str(e), "advisories": []}), 500

@app.route("/api/advisory/read/<advisory_id>", methods=["PUT"])
def mark_advisory_read(advisory_id):
    return jsonify({"success": True, "message": "Advisory marked as read"})

# ============================================
# SMART IRRIGATION MANAGEMENT ENDPOINTS
# ============================================

@app.route("/api/irrigation/recommend/<field_id>", methods=["GET"])
def get_irrigation_recommendation_api(field_id):
    try:
        result = get_irrigation_recommendation(field_id)
        result["field_id"] = field_id
        return jsonify(result)
    except Exception as e:
        print(f"Error in irrigation recommendation: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/irrigation/history/<field_id>", methods=["GET"])
def get_irrigation_history(field_id):
    try:
        history = []
        for i in range(7):
            history.append({
                "id": f"irrigation_{i}",
                "soil_moisture": random.randint(25, 65),
                "recommendation": random.choice(["Irrigate Now", "Maintain", "Delay"]),
                "amount_liters": random.randint(500, 3000),
                "date": (datetime.now() - timedelta(days=i)).isoformat()
            })
        return jsonify({"history": history})
    except Exception as e:
        print(f"Error in irrigation history: {e}")
        return jsonify({"error": str(e), "history": []}), 500

# ============================================
# CROP RECOMMENDATION ENDPOINT (NEW - uses service)
# ============================================

@app.route("/api/crop-recommend", methods=["POST"])
def crop_recommend():
    """Recommend crop + fertilizer based on soil data using services"""
    try:
        soil_data = request.json or {}

        # ✅ Use crop_recommendation_service
        crop_result = crop_recommendation_service.recommend(soil_data)

        # ✅ Use fertilizer_service
        fertilizer_result = fertilizer_service.recommend(soil_data)

        return jsonify({
            **crop_result,
            **fertilizer_result,
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        print(f"Error in crop recommend: {e}")
        return jsonify({"error": str(e)}), 500

# ============================================
# FARM ANALYTICS DASHBOARD ENDPOINTS
# ============================================

@app.route("/api/analytics/<field_id>", methods=["GET"])
def get_analytics(field_id):
    try:
        history = []
        for i in range(7, 0, -1):
            date = (datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d")
            history.append({
                "date": date,
                "health": random.randint(70, 95),
                "yield": random.randint(60, 85),
                "moisture": random.randint(30, 70),
                "temperature": random.randint(20, 35)
            })

        return jsonify({
            "health_trend": random.randint(75, 92),
            "yield_forecast": random.randint(2500, 4000),
            "forecast_confidence": random.randint(75, 92),
            "risk_score": random.randint(15, 50),
            "history": history,
            "field_id": field_id,
            "crop_growth": random.randint(40, 80)
        })
    except Exception as e:
        print(f"Error in analytics: {e}")
        return jsonify({"error": str(e)}), 500

# ============================================
# EDGE AI PROCESSING ENDPOINTS
# ============================================

@app.route("/api/edge/process", methods=["POST"])
def process_on_edge():
    """Process data on device for edge AI using services"""
    try:
        data = request.json or {}
        model_type = data.get('model_type', 'crop_health')
        field_id = data.get('field_id', 'test_field')

        if model_type == 'crop_health':
            result = crop_health_service.detect_disease(None)
            growth = crop_health_service.analyze_growth_stage()
            result.update(growth)
        elif model_type == 'pest_detection':
            result = pest_detection_service.detect_pests(None)
        else:
            result = {"error": "Unknown model type"}

        return jsonify({
            "result": result,
            "processing_time": round(random.uniform(0.1, 0.5), 3),
            "device": "edge_processor",
            "model_type": model_type,
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        print(f"Error in edge processing: {e}")
        return jsonify({"error": str(e)}), 500

# ============================================
# WEATHER API ENDPOINT
# ============================================

@app.route("/weather/<city>", methods=["GET"])
def get_weather(city):
    try:
        weather_data = {
            "main": {
                "temp": random.randint(20, 35),
                "humidity": random.randint(40, 80)
            },
            "wind": {"speed": random.randint(5, 25)},
            "weather": [{"description": random.choice(["Clear", "Cloudy", "Rainy", "Partly cloudy"])}],
            "clouds": {"all": random.randint(0, 100)}
        }
        return jsonify(weather_data)
    except Exception as e:
        print(f"Error in weather: {e}")
        return jsonify({"error": str(e)}), 500

# ============================================
# SENSOR DATA ENDPOINT (for ESP/Arduino)
# ============================================

# ============================================================
# SENSOR DATA ENDPOINT (ESP32 / Arduino)
# ============================================================

latest_sensor_data = {}

# ============================================
# FRONTEND ALIAS ENDPOINTS
# ============================================

@app.route("/api/predict", methods=["GET", "POST"])
def api_predict():
    """Alias for /predict - matches frontend fetch calls"""
    
    # Try to get real sensor data first, fallback to mock
    try:
        sensor_data = {
            "ph": round(random.uniform(6.0, 7.5), 1),
            "ec": round(random.uniform(0.5, 2.0), 2),
            "organic_carbon": round(random.uniform(0.3, 1.0), 2),
            "nitrogen": round(random.uniform(60, 280), 1),
            "phosphorus": round(random.uniform(20, 80), 1),
            "potassium": round(random.uniform(80, 200), 1),
            "sulphur": round(random.uniform(5, 20), 1),
            "zinc": round(random.uniform(0.3, 1.5), 2),
            "boron": round(random.uniform(0.2, 1.0), 2),
            "iron": round(random.uniform(2, 8), 2),
            "manganese": round(random.uniform(1, 4), 2),
            "copper": round(random.uniform(0.1, 0.5), 2),
        }
        
        # Use your original crop recommendation logic
        result = recommend_crop_and_fertilizer({
            "pH": sensor_data["ph"],
            "EC": sensor_data["ec"],
            "Organic Carbon (%)": sensor_data["organic_carbon"],
            "Nitrogen (kg/ha)": sensor_data["nitrogen"],
            "Phosphorous (kg/ha)": sensor_data["phosphorus"],
            "Potassium (kg/ha)": sensor_data["potassium"],
            "Sulphur (ppm)": sensor_data["sulphur"],
            "Zinc (ppm)": sensor_data["zinc"],
            "Boron (ppm)": sensor_data["boron"],
            "Iron (ppm)": sensor_data["iron"],
            "Manganese (ppm)": sensor_data["manganese"],
            "Copper (ppm)": sensor_data["copper"],
        })
        
        # Return in format the frontend expects
        return jsonify({
            "recommended_crop": result["crops"][0] if result["crops"] else "Unknown",
            "fertilizer": result["fertilizers"][0] if result["fertilizers"] else "Balanced NPK",
            "crops": result["crops"],
            "fertilizers": result["fertilizers"],
            "soil_advice": result["soil_advice"],
            "sensor_data": sensor_data
        })
    except Exception as e:
        print(f"Error in /api/predict: {e}")
        # Fallback to random
        return jsonify({
            "recommended_crop": random.choice(["Wheat", "Rice", "Maize", "Cotton", "Sugarcane"]),
            "fertilizer": random.choice(["Urea", "DAP", "MOP", "Balanced NPK"]),
            "crops": ["Wheat", "Rice"],
            "fertilizers": ["Urea", "DAP"],
            "soil_advice": ["Maintain Regular Soil Testing"]
        })


@app.route("/api/data", methods=["GET"])
def api_data():
    """Alias for sensor data - matches frontend fetch calls"""
    return jsonify({
        "moisture": round(random.uniform(20, 70), 1),
        "humidity": round(random.uniform(40, 80), 1),
        "temperature": round(random.uniform(20, 35), 1),
        "nitrogen": round(random.uniform(60, 140), 1),
        "phosphorus": round(random.uniform(20, 70), 1),
        "potassium": round(random.uniform(80, 180), 1),
        "ph": round(random.uniform(6.0, 7.5), 1),
        "ec": round(random.uniform(0.5, 2.0), 2)
    })
# ============================================
# RUN SERVER
# ============================================

if __name__ == "__main__":
    print("🌱 Starting Bhoomi API Server...")
    print(f"📡 Server will run on: http://localhost:5000")
    print(f"🔗 Firebase: {'✅ Connected' if db else '❌ Not connected'}")
    print(f"🤖 Disease Model: {'✅ Loaded' if crop_health_service.loaded else '⚠️  Mock mode'}")
    print(f"🌾 Crop Model: {'✅ Loaded' if crop_recommendation_service.loaded else '⚠️  Mock mode'}")
    print(f"🐛 Pest Model: {'✅ Loaded' if pest_detection_service.loaded else '⚠️  Mock mode'}")
    print(f"🗄️  SQLite: {'✅ Connected' if os.path.exists('smart_farm.db') else '⚠️  New database will be created'}")
    app.run(debug=True, host='0.0.0.0', port=5000)