import { useState } from 'react';
import { SoilData } from '../types';
import { Beaker, Leaf, TrendingUp, Package } from 'lucide-react';

interface FertilizerRecommendationProps {
  soilData: SoilData;
}

interface FertilizerSuggestion {
  name: string;
  type: string;
  quantity: string;
  application: string;
  benefit: string;
  priority: 'high' | 'medium' | 'low';
}

export function FertilizerRecommendation({ soilData }: FertilizerRecommendationProps) {
  const [selectedCrop, setSelectedCrop] = useState('rice');

  const crops = [
    { id: 'rice', name: 'Rice' },
    { id: 'wheat', name: 'Wheat' },
    { id: 'cotton', name: 'Cotton' },
    { id: 'sugarcane', name: 'Sugarcane' },
    { id: 'maize', name: 'Maize' },
    { id: 'vegetables', name: 'Vegetables' },
  ];

  const getFertilizerRecommendations = (): FertilizerSuggestion[] => {
    const recommendations: FertilizerSuggestion[] = [];
    const { nitrogen, phosphorus, potassium, ph } = soilData;

    // Nitrogen recommendations
    if (nitrogen < 20) {
      recommendations.push({
        name: 'Urea',
        type: 'Nitrogen Fertilizer',
        quantity: '120-150 kg/hectare',
        application: 'Split application: 50% at sowing, 25% at tillering, 25% at flowering',
        benefit: 'Boosts vegetative growth and green foliage',
        priority: 'high',
      });
    } else if (nitrogen < 35) {
      recommendations.push({
        name: 'Ammonium Sulfate',
        type: 'Nitrogen Fertilizer',
        quantity: '80-100 kg/hectare',
        application: 'Apply in 2-3 split doses during growing season',
        benefit: 'Provides nitrogen and sulfur for balanced growth',
        priority: 'medium',
      });
    }

    // Phosphorus recommendations
    if (phosphorus < 15) {
      recommendations.push({
        name: 'DAP (Diammonium Phosphate)',
        type: 'Phosphorus Fertilizer',
        quantity: '100-120 kg/hectare',
        application: 'Apply at sowing or transplanting time',
        benefit: 'Promotes root development and early plant growth',
        priority: 'high',
      });
    } else if (phosphorus < 25) {
      recommendations.push({
        name: 'Single Super Phosphate (SSP)',
        type: 'Phosphorus Fertilizer',
        quantity: '60-80 kg/hectare',
        application: 'Basal application before sowing',
        benefit: 'Enhances flowering and fruiting',
        priority: 'medium',
      });
    }

    // Potassium recommendations
    if (potassium < 100) {
      recommendations.push({
        name: 'Muriate of Potash (MOP)',
        type: 'Potassium Fertilizer',
        quantity: '80-100 kg/hectare',
        application: 'Apply 50% at sowing, 50% at flowering stage',
        benefit: 'Improves disease resistance and crop quality',
        priority: 'high',
      });
    } else if (potassium < 200) {
      recommendations.push({
        name: 'Potassium Sulfate',
        type: 'Potassium Fertilizer',
        quantity: '50-60 kg/hectare',
        application: 'Apply during vegetative growth stage',
        benefit: 'Strengthens stems and enhances fruit quality',
        priority: 'medium',
      });
    }

    // pH-based recommendations
    if (ph < 6.0) {
      recommendations.push({
        name: 'Lime (Calcium Carbonate)',
        type: 'Soil Amendment',
        quantity: '500-1000 kg/hectare',
        application: 'Apply 2-3 weeks before sowing',
        benefit: 'Raises soil pH and provides calcium',
        priority: 'high',
      });
    } else if (ph > 7.5) {
      recommendations.push({
        name: 'Gypsum',
        type: 'Soil Amendment',
        quantity: '400-600 kg/hectare',
        application: 'Apply before sowing and incorporate into soil',
        benefit: 'Reduces soil alkalinity and provides calcium',
        priority: 'medium',
      });
    }

    // Crop-specific additions
    if (selectedCrop === 'rice' && nitrogen > 30) {
      recommendations.push({
        name: 'NPK Complex 20:20:0',
        type: 'Complex Fertilizer',
        quantity: '100 kg/hectare',
        application: 'Apply at panicle initiation stage',
        benefit: 'Ensures balanced nutrition during critical growth stage',
        priority: 'medium',
      });
    }

    if (selectedCrop === 'cotton' && potassium > 150) {
      recommendations.push({
        name: 'NPK Complex 19:19:19',
        type: 'Complex Fertilizer',
        quantity: '75-100 kg/hectare',
        application: 'Apply at flowering and boll formation',
        benefit: 'Promotes fiber quality and boll development',
        priority: 'medium',
      });
    }

    // Organic recommendations
    recommendations.push({
      name: 'Farm Yard Manure (FYM)',
      type: 'Organic Fertilizer',
      quantity: '10-15 tons/hectare',
      application: 'Apply 2-3 weeks before sowing and mix with soil',
      benefit: 'Improves soil structure, water retention, and microbial activity',
      priority: 'low',
    });

    return recommendations;
  };

  const recommendations = getFertilizerRecommendations();

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'bg-red-50 border-red-200 text-red-800';
      case 'medium': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'low': return 'bg-green-50 border-green-200 text-green-800';
    }
  };

  const getPriorityBadge = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'bg-red-600 text-white';
      case 'medium': return 'bg-yellow-600 text-white';
      case 'low': return 'bg-green-600 text-white';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="flex items-center gap-2">
          <Beaker className="w-5 h-5 text-purple-600" />
          Fertilizer Recommendations
        </h3>
      </div>

      {/* Crop Selector */}
      <div className="mb-6">
        <label className="block text-sm text-gray-600 mb-2">Select Crop</label>
        <select
          value={selectedCrop}
          onChange={(e) => setSelectedCrop(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          {crops.map((crop) => (
            <option key={crop.id} value={crop.id}>
              {crop.name}
            </option>
          ))}
        </select>
      </div>

      {/* Recommendations */}
      <div className="space-y-4">
        {recommendations.map((fert, index) => (
          <div
            key={index}
            className={`p-4 border-2 rounded-lg ${getPriorityColor(fert.priority)}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <Package className="w-8 h-8" />
                <div>
                  <h4 className="text-lg">{fert.name}</h4>
                  <div className="text-xs opacity-75">{fert.type}</div>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs uppercase ${getPriorityBadge(fert.priority)}`}>
                {fert.priority}
              </span>
            </div>

            <div className="space-y-2 mt-3 text-sm">
              <div className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">Quantity:</span> {fert.quantity}
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Leaf className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">Application:</span> {fert.application}
                </div>
              </div>
              <div className="p-2 bg-white/50 rounded mt-2">
                <span className="font-medium">Benefit:</span> {fert.benefit}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* NPK Status */}
      <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
        <h4 className="text-sm mb-3">Current NPK Status for {crops.find(c => c.id === selectedCrop)?.name}</h4>
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <div className="text-2xl text-blue-600">{soilData.nitrogen}</div>
            <div className="text-xs text-gray-600">N (Nitrogen)</div>
            <div className="text-xs mt-1">
              {soilData.nitrogen < 20 ? '⚠️ Low' : soilData.nitrogen > 50 ? '⚠️ High' : '✓ Good'}
            </div>
          </div>
          <div>
            <div className="text-2xl text-purple-600">{soilData.phosphorus}</div>
            <div className="text-xs text-gray-600">P (Phosphorus)</div>
            <div className="text-xs mt-1">
              {soilData.phosphorus < 15 ? '⚠️ Low' : soilData.phosphorus > 40 ? '⚠️ High' : '✓ Good'}
            </div>
          </div>
          <div>
            <div className="text-2xl text-pink-600">{soilData.potassium}</div>
            <div className="text-xs text-gray-600">K (Potassium)</div>
            <div className="text-xs mt-1">
              {soilData.potassium < 100 ? '⚠️ Low' : soilData.potassium > 300 ? '⚠️ High' : '✓ Good'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
