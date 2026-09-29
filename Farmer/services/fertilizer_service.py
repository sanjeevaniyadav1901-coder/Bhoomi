class FertilizerService:
    def recommend(self, soil_data):
        """
        Recommend fertilizers based on soil nutrients.
        Rule-based logic (unchanged from original).
        """
        N = soil_data.get('nitrogen', soil_data.get('N', 100))
        P = soil_data.get('phosphorus', soil_data.get('P', 40))
        K = soil_data.get('potassium', soil_data.get('K', 110))
        S = soil_data.get('sulphur', soil_data.get('S', 10))
        Zn = soil_data.get('zinc', soil_data.get('Zn', 0.6))
        B = soil_data.get('boron', soil_data.get('B', 0.5))
        Fe = soil_data.get('iron', soil_data.get('Fe', 4))
        Mn = soil_data.get('manganese', soil_data.get('Mn', 2))
        Cu = soil_data.get('copper', soil_data.get('Cu', 0.2))
        OC = soil_data.get('organic_carbon', 0.5)

        fertilizers = []

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

        if not fertilizers:
            fertilizers.append("Balanced NPK")

        return {
            "fertilizers": list(set(fertilizers)),
            "model_used": "Rule-based"
        }


# Singleton
fertilizer_service = FertilizerService()