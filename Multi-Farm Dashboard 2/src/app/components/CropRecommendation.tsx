import { useEffect } from 'react';
import { SoilData } from '../types';
import { Sprout, TrendingUp, AlertCircle } from 'lucide-react';

interface CropRecommendationProps {
  soilData: SoilData;
}

interface CropSuggestion {
  name: string;
  suitability: number;
  reason: string;
  season: string;
}

export function CropRecommendation({ soilData }: CropRecommendationProps) {

  // 🔥 NEW: Save soil data to backend
  useEffect(() => {
    const saveSoilData = async () => {
      try {
        await fetch("http://127.0.0.1:5000/save-soil", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(soilData),
        });
      } catch (error) {
        console.error("Failed to save soil data");
      }
    };

    if (soilData) {
      saveSoilData();
    }
  }, [soilData]);

  // ML-based crop recommendation logic
  const getCropRecommendations = (): CropSuggestion[] => {
    const crops: CropSuggestion[] = [];
    const { nitrogen, phosphorus, potassium, ph, moisture, ec } = soilData;

    if (nitrogen > 30 && ph >= 5.5 && ph <= 7.0 && moisture > 60) {
      crops.push({
        name: 'Rice',
        suitability: 95,
        reason: 'High nitrogen and optimal pH for rice cultivation',
        season: 'Kharif (Monsoon)',
      });
    }

    if (nitrogen > 25 && phosphorus > 20 && potassium > 150 && ph >= 6.0 && ph <= 7.5) {
      crops.push({
        name: 'Wheat',
        suitability: 92,
        reason: 'Balanced NPK levels ideal for wheat',
        season: 'Rabi (Winter)',
      });
    }

    if (potassium > 200 && ph >= 6.5 && ph <= 8.0 && moisture < 60) {
      crops.push({
        name: 'Cotton',
        suitability: 88,
        reason: 'High potassium content suitable for cotton',
        season: 'Kharif (Monsoon)',
      });
    }

    if (nitrogen > 35 && moisture > 50 && ph >= 6.0 && ph <= 7.5) {
      crops.push({
        name: 'Sugarcane',
        suitability: 90,
        reason: 'High nitrogen and good moisture retention',
        season: 'Year-round',
      });
    }

    if (nitrogen > 20 && phosphorus > 15 && potassium > 100 && ph >= 5.5 && ph <= 7.0) {
      crops.push({
        name: 'Maize',
        suitability: 87,
        reason: 'Well-balanced soil nutrients for maize',
        season: 'Kharif (Monsoon)',
      });
    }

    if (nitrogen < 30 && phosphorus > 15 && ph >= 6.0 && ph <= 7.5) {
      crops.push({
        name: 'Lentils',
        suitability: 85,
        reason: 'Good for nitrogen-fixing legumes',
        season: 'Rabi (Winter)',
      });
    }

    if (nitrogen > 25 && phosphorus > 20 && potassium > 150 && moisture > 40) {
      crops.push({
        name: 'Vegetables',
        suitability: 83,
        reason: 'Nutrient-rich soil suitable for vegetables',
        season: 'Year-round',
      });
    }

    return crops.sort((a, b) => b.suitability - a.suitability).slice(0, 5);
  };

  const recommendations = getCropRecommendations();

  const getSuitabilityColor = (suitability: number) => {
    if (suitability >= 90) return 'text-green-600 bg-green-50';
    if (suitability >= 80) return 'text-blue-600 bg-blue-50';
    return 'text-yellow-600 bg-yellow-50';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="mb-4 flex items-center gap-2">
        <Sprout className="w-5 h-5 text-green-600" />
        Crop Recommendations
      </h3>

      {recommendations.length > 0 ? (
        <div className="space-y-3">
          {recommendations.map((crop, index) => (
            <div
              key={crop.name}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${getSuitabilityColor(crop.suitability)} flex items-center justify-center`}>
                    <span className="text-sm">#{index + 1}</span>
                  </div>
                  <div>
                    <h4 className="text-lg">{crop.name}</h4>
                    <div className="text-xs text-gray-500">{crop.season}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className={`text-sm px-2 py-1 rounded ${getSuitabilityColor(crop.suitability)}`}>
                      {crop.suitability}% Match
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">{crop.reason}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <AlertCircle className="w-12 h-12 mx-auto mb-2 text-yellow-500" />
          <div>Insufficient soil data for crop recommendations</div>
          <div className="text-sm">Please ensure all soil parameters are measured</div>
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm mb-3">Soil Health Summary</h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            Nitrogen: <span>{soilData.nitrogen}</span>
          </div>
          <div>
            Phosphorus: <span>{soilData.phosphorus}</span>
          </div>
          <div>
            Potassium: <span>{soilData.potassium}</span>
          </div>
          <div>
            pH: <span>{soilData.ph}</span>
          </div>
        </div>
      </div>
    </div>
  );
}