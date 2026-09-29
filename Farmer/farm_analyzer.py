import pandas as pd
from datetime import datetime
import random


class FarmAnalyzer:

    def __init__(self, farmer_data, crops_data, soil_data):
        self.farmer = farmer_data
        self.crops = crops_data
        self.soil = soil_data

    # ---------------- WEATHER SIMULATION ---------------- #

    def get_weather_data(self, location):

        weather = {
            'temp': random.randint(20, 35),
            'humidity': random.randint(30, 80),
            'rain_forecast': random.choice(
                ['Clear', 'Light Rain', 'Heavy Rain', 'Cloudy']
            )
        }

        return weather

    # ---------------- CROP HEALTH ---------------- #

    def calculate_crop_health(self):

        if not self.crops:
            return pd.DataFrame()

        report = []

        for crop in self.crops:

            name = crop[2]

            try:
                sowing_date = datetime.strptime(crop[3], "%Y-%m-%d")
            except:
                continue

            days_passed = (datetime.now() - sowing_date).days

            if days_passed < 30:
                stage = "🌱 Seedling"
            elif days_passed < 60:
                stage = "🌿 Vegetative"
            elif days_passed < 90:
                stage = "🌼 Flowering"
            else:
                stage = "🌾 Harvest Ready"

            report.append({
                'Crop': name,
                'Days': days_passed,
                'Stage': stage,
                'Season': crop[4]
            })

        return pd.DataFrame(report)

    # ---------------- FERTILIZER ADVICE ---------------- #

    def generate_fertilizer_advice(self):

        if not self.soil:
            return ["⚠️ No soil data found. Please add soil details."]

        latest = self.soil[0]

        # Correct column indexes
        ph = latest[9]
        n = latest[12]
        p = latest[13]
        k = latest[14]

        # Handle None values
        n = n if n is not None else 0
        p = p if p is not None else 0
        k = k if k is not None else 0
        ph = ph if ph is not None else 7

        advice = []

        # Nitrogen
        if n < 280:
            advice.append("🔴 Low Nitrogen: Apply Urea or Compost.")
        elif n > 560:
            advice.append("🟡 High Nitrogen: Reduce chemical fertilizers.")
        else:
            advice.append("🟢 Nitrogen is optimal.")

        # Phosphorus
        if p < 22:
            advice.append("🔴 Low Phosphorus: Apply DAP fertilizer.")
        elif p > 56:
            advice.append("🟡 High Phosphorus detected.")
        else:
            advice.append("🟢 Phosphorus level is good.")

        # Potassium
        if k < 140:
            advice.append("🔴 Low Potassium: Apply MOP fertilizer.")
        elif k > 330:
            advice.append("🟡 Potassium too high.")
        else:
            advice.append("🟢 Potassium level is balanced.")

        # Soil pH
        if ph < 5.5:
            advice.append("🔴 Soil is Acidic: Add Lime.")
        elif ph > 7.5:
            advice.append("🔴 Soil is Alkaline: Add Gypsum.")
        else:
            advice.append("🟢 Soil pH is suitable for most crops.")

        return advice

    # ---------------- WEATHER ALERTS ---------------- #

    def get_alerts(self, location):

        weather = self.get_weather_data(location)

        alerts = []

        if weather['rain_forecast'] == 'Heavy Rain':
            alerts.append(
                f"🌧️ ALERT: Heavy rain expected in {location}. Delay irrigation."
            )

        if weather['temp'] > 35:
            alerts.append(
                f"☀️ ALERT: High temperature {weather['temp']}°C. Protect crops."
            )

        if weather['humidity'] < 40 and weather['rain_forecast'] == 'Clear':
            alerts.append("💧 Irrigation recommended today.")

        if not alerts:
            alerts.append("✅ Weather conditions are normal.")

        return alerts, weather