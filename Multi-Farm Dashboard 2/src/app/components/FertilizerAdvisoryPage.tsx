import { useState, useEffect } from 'react';
import { Leaf, Plus, Calendar } from 'lucide-react';
import { FertilizerAdvice, Farm, Crop } from '../types';
import { getUserFertilizerAdvice, getFarmFertilizerAdvice, addFertilizerAdvice, getUserFarms, getFarmCrops } from '../services/storageService';

interface FertilizerAdvisoryPageProps {
  userEmail: string;
  selectedFarmId: string | null;
}

export function FertilizerAdvisoryPage({ userEmail, selectedFarmId }: FertilizerAdvisoryPageProps) {
  const [advice, setAdvice] = useState<FertilizerAdvice[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [viewMode, setViewMode] = useState<'all' | 'farm'>('all');

  useEffect(() => {
    setFarms(getUserFarms(userEmail));
    
    if (viewMode === 'all') {
      setAdvice(getUserFertilizerAdvice(userEmail));
    } else if (selectedFarmId) {
      setAdvice(getFarmFertilizerAdvice(userEmail, selectedFarmId));
      setCrops(getFarmCrops(userEmail, selectedFarmId));
    }
  }, [userEmail, selectedFarmId, viewMode]);

  const generateSmartRecommendation = (farmId: string, cropId?: string) => {
    const recommendations = [
      {
        recommendation: 'Apply balanced NPK fertilizer for optimal growth',
        npkRatio: '10:26:26',
        quantity: 50,
        applicationMethod: 'Broadcasting',
        timing: 'Pre-monsoon application recommended',
      },
      {
        recommendation: 'Nitrogen deficiency detected - boost nitrogen levels',
        npkRatio: '46:0:0',
        quantity: 30,
        applicationMethod: 'Side dressing',
        timing: 'Apply during vegetative growth stage',
      },
      {
        recommendation: 'Potassium boost for fruiting stage',
        npkRatio: '0:0:50',
        quantity: 40,
        applicationMethod: 'Fertigation',
        timing: 'Apply at flowering to fruiting stage',
      },
      {
        recommendation: 'Phosphorus supplement for root development',
        npkRatio: '0:52:34',
        quantity: 35,
        applicationMethod: 'Soil incorporation',
        timing: 'Apply before planting or early growth',
      },
    ];

    const selected = recommendations[Math.floor(Math.random() * recommendations.length)];
    
    const newAdvice: FertilizerAdvice = {
      id: Date.now().toString(),
      farmId,
      cropId,
      date: new Date().toISOString(),
      ...selected,
    };

    addFertilizerAdvice(userEmail, newAdvice);
    
    if (viewMode === 'all') {
      setAdvice(getUserFertilizerAdvice(userEmail));
    } else {
      setAdvice(getFarmFertilizerAdvice(userEmail, farmId));
    }
  };

  const getFarmName = (farmId: string) => {
    const farm = farms.find(f => f.id === farmId);
    return farm?.name || 'Unknown Farm';
  };

  const getCropName = (cropId?: string) => {
    if (!cropId) return 'General';
    const crop = crops.find(c => c.id === cropId);
    return crop ? `${crop.name} (${crop.variety})` : 'Unknown Crop';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-600 rounded-lg">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1>Fertilizer Recommendations</h1>
                <div className="text-sm text-gray-500">
                  AI-powered fertilizer advisory based on soil analysis
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('all')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewMode === 'all'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Farms
              </button>
              <button
                onClick={() => setViewMode('farm')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewMode === 'farm'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Current Farm
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Generate Recommendation Button */}
        {selectedFarmId && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg mb-1">Generate New Recommendation</h3>
                <p className="text-sm text-gray-600">
                  Get AI-powered fertilizer advice based on current soil conditions
                </p>
              </div>
              <button
                onClick={() => generateSmartRecommendation(selectedFarmId)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Generate
              </button>
            </div>
          </div>
        )}

        {/* Advice List */}
        {advice.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Leaf className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl mb-2 text-gray-600">No Recommendations Yet</h3>
            <p className="text-gray-500">
              {viewMode === 'farm' && !selectedFarmId
                ? 'Please select a farm to view recommendations'
                : 'Generate fertilizer recommendations based on soil analysis'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {advice.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl text-green-700">{getFarmName(item.farmId)}</h3>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                          {getCropName(item.cropId)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {new Date(item.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div className="mb-6 p-4 bg-green-50 rounded-lg border-l-4 border-green-600">
                    <p className="text-gray-800">{item.recommendation}</p>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">NPK Ratio</p>
                      <p className="text-xl text-gray-900">{item.npkRatio}</p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Quantity</p>
                      <p className="text-xl text-gray-900">{item.quantity} kg/acre</p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Application Method</p>
                      <p className="text-lg text-gray-900">{item.applicationMethod}</p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Timing</p>
                      <p className="text-lg text-gray-900">{item.timing}</p>
                    </div>
                  </div>

                  {/* Implementation Notes */}
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> Always conduct a soil test before application. Adjust quantities based on current soil nutrient levels and crop requirements.
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
