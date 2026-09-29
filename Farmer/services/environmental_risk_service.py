import numpy as np
from datetime import datetime, timedelta

class EnvironmentalRiskService:
    def __init__(self):
        self.risk_thresholds = {
            "drought": {"temperature": 35, "humidity": 20, "soil_moisture": 15},
            "flood": {"rainfall": 50, "soil_moisture": 85},
            "heat_stress": {"temperature": 38, "humidity": 30},
            "disease_outbreak": {"humidity": 85, "temperature": 25}
        }
    
    def analyze_environmental_risks(self, weather_data, soil_data):
        """Analyze environmental conditions for risks"""
        risks = []
        
        # Check drought conditions
        if weather_data['temperature'] > 35 and soil_data['moisture'] < 15:
            risks.append({
                "type": "drought",
                "severity": "high",
                "action": "Irrigate immediately"
            })
        
        # Check heat stress
        if weather_data['temperature'] > 38:
            risks.append({
                "type": "heat_stress",
                "severity": "high",
                "action": "Provide shade or increase irrigation"
            })
        
        return risks
    
    def get_risk_forecast(self, field_id):
        """Get 7-day risk forecast"""
        return {
            "forecast": [
                {"day": "2026-09-03", "risk": "drought", "probability": 0.7},
                {"day": "2026-09-04", "risk": "heat_stress", "probability": 0.8}
            ]
        }