import pandas as pd
from datetime import datetime, timedelta
import random


class FarmAnalyzer:
    def __init__(self, farmer_data, crops_data, soil_data):
        self.farmer = farmer_data
        self.crops = crops_data
        self.soil = soil_data

    def get_weather_data(self, location):
        """Simulate Weather API Call."""
        weather = {
            'temp': random.randint(20, 35),
            'humidity': random.randint(30, 80),
            'rain_forecast': random.choice(['Clear', 'Light Rain', 'Heavy Rain', 'Cloudy'])
        }
        return weather

    def calculate_crop_health(self):
        """Analyze crop stage and health"""
        # --- FIX: Return an empty DataFrame instead of a list if no crops exist ---
        if not self.crops:
            return pd.DataFrame()

        report = []
        for crop in self.crops:
            # crop structure: (id, farmer_id, name, sowing_date, season, status)
            name = crop[2]
            try:
                sowing_date = datetime.strptime(crop[3], "%Y-%m-%d")
            except ValueError:
                # Handle cases where date format might be wrong
                continue

            days_passed = (datetime.now() - sowing_date).days

            # Simple Logic for Growth Stage
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

    def generate_fertilizer_advice(self):
        """Rule-based logic for recommendations"""
        if not self.soil:
            return ["⚠️ No soil data found. Please add soil details (Option 2)."]

        # Get latest record
        latest = self.soil[0]
        # structure: (id, farmer_id, date, n, p, k, ph, source)
        n, p, k, ph = latest[3], latest[4], latest[5], latest[6]

        advice = []

        # Nitrogen Logic
        if n < 280:
            advice.append("🔴 Low Nitrogen: Apply Urea or Compost.")
        elif n > 560:
            advice.append("🟡 High Nitrogen: Reduce chemical fertilizers.")
        else:
            advice.append("🟢 Nitrogen is optimal.")

        # pH Logic
        if ph < 5.5:
            advice.append("🔴 Soil is Acidic: Add Lime.")
        elif ph > 7.5:
            advice.append("🔴 Soil is Alkaline: Add Gypsum.")
        else:
            advice.append("🟢 pH level is good for most crops.")

        return advice

    def get_alerts(self, location):
        """Generate Farming Alerts based on Weather + Crop"""
        weather = self.get_weather_data(location)
        alerts = []

        # Weather Alerts
        if weather['rain_forecast'] == 'Heavy Rain':
            alerts.append(f"🌧️ ALERT: Heavy rain in {location}. Delay irrigation & fertilizer.")
        elif weather['temp'] > 35:
            alerts.append(f"☀️ ALERT: High heat ({weather['temp']}°C). Ensure hydration for crops.")

        # Irrigation Alert
        if weather['humidity'] < 40 and weather['rain_forecast'] == 'Clear':
            alerts.append("💧 ADVICE: Low humidity. Irrigation recommended today.")

        if not alerts:
            alerts.append("✅ Weather looks good. Standard farming routine applies.")

        return alerts, weather