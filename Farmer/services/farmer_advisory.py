import random


class FarmerAdvisoryService:
    def generate_advisory(self, crop_health, pest_data, weather_data, soil_data):
        advisories = []

        # Irrigation
        moisture = soil_data.get('moisture', 50)
        if moisture < 25:
            advisories.append({
                "type": "Irrigation", "priority": "high",
                "message": "Soil moisture below critical threshold",
                "action": f"Irrigate now with {random.randint(1000, 3000)} L/ha"
            })
        elif moisture > 80:
            advisories.append({
                "type": "Irrigation", "priority": "medium",
                "message": "Soil moisture above optimal",
                "action": "Reduce irrigation"
            })

        # Disease
        if crop_health.get('disease') and crop_health['disease'] != "Healthy":
            advisories.append({
                "type": "Disease",
                "priority": "high" if crop_health.get('severity') == "high" else "medium",
                "message": f"{crop_health['disease']} detected",
                "action": "Apply recommended treatment"
            })

        # Pest
        if pest_data.get('pests_found'):
            advisories.append({
                "type": "Pest",
                "priority": "medium",
                "message": f"{len(pest_data['pests_found'])} pest(s) detected",
                "action": pest_data.get('action_needed', 'Monitor')
            })

        # Weather
        if weather_data.get('temperature', 0) > 35:
            advisories.append({
                "type": "Weather", "priority": "high",
                "message": "High temperature alert",
                "action": "Provide shade, increase irrigation"
            })

        return {
            "advisories": advisories,
            "total_alerts": len(advisories),
            "summary": f"{len(advisories)} advisories"
        }


# Singleton
farmer_advisory_service = FarmerAdvisoryService()