import { useState, useEffect } from 'react';
import { Sprout, TrendingUp, TrendingDown, AlertCircle, Calendar } from 'lucide-react';
import { Crop } from '../types';
import { getUserCrops, getFarmCrops } from '../services/storageService';

interface CropHealthPageProps {
  userEmail: string;
  selectedFarmId: string | null;
}

export function CropHealthPage({ userEmail, selectedFarmId }: CropHealthPageProps) {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [viewMode, setViewMode] = useState<'all' | 'farm'>('all');

  useEffect(() => {
    if (viewMode === 'all') {
      setCrops(getUserCrops(userEmail));
    } else if (selectedFarmId) {
      setCrops(getFarmCrops(userEmail, selectedFarmId));
    }
  }, [userEmail, selectedFarmId, viewMode]);

  const getHealthColor = (health: Crop['health']) => {
    switch (health) {
      case 'excellent':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'good':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'fair':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'poor':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStageColor = (stage: Crop['stage']) => {
    switch (stage) {
      case 'seedling':
        return 'bg-purple-100 text-purple-700';
      case 'vegetative':
        return 'bg-green-100 text-green-700';
      case 'flowering':
        return 'bg-pink-100 text-pink-700';
      case 'fruiting':
        return 'bg-orange-100 text-orange-700';
      case 'harvesting':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const calculateDaysToHarvest = (expectedDate: string) => {
    const today = new Date();
    const harvest = new Date(expectedDate);
    const diffTime = harvest.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const healthStats = {
    excellent: crops.filter(c => c.health === 'excellent').length,
    good: crops.filter(c => c.health === 'good').length,
    fair: crops.filter(c => c.health === 'fair').length,
    poor: crops.filter(c => c.health === 'poor').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-600 rounded-lg">
                <Sprout className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1>Crop Health & Stages</h1>
                <div className="text-sm text-gray-500">
                  Monitor crop health and growth stages
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
                All Crops
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
        {/* Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Excellent</p>
                <p className="text-2xl text-green-700">{healthStats.excellent}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Good</p>
                <p className="text-2xl text-blue-700">{healthStats.good}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Fair</p>
                <p className="text-2xl text-yellow-700">{healthStats.fair}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Poor</p>
                <p className="text-2xl text-red-700">{healthStats.poor}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Crops List */}
        {crops.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Sprout className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl mb-2 text-gray-600">No Crops Found</h3>
            <p className="text-gray-500">
              {viewMode === 'farm' && !selectedFarmId
                ? 'Please select a farm to view crops'
                : 'Add crops to start monitoring their health and growth stages'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {crops.map((crop) => {
              const daysToHarvest = calculateDaysToHarvest(crop.expectedHarvestDate);
              
              return (
                <div key={crop.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  {/* Crop Header */}
                  <div className="p-4 bg-gradient-to-r from-green-500 to-green-600 text-white">
                    <h3 className="text-xl">{crop.name}</h3>
                    <p className="text-sm text-green-100">{crop.variety}</p>
                  </div>

                  {/* Crop Details */}
                  <div className="p-4 space-y-3">
                    {/* Health Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Health Status</span>
                      <span className={`px-3 py-1 rounded-full text-sm border ${getHealthColor(crop.health)}`}>
                        {crop.health.charAt(0).toUpperCase() + crop.health.slice(1)}
                      </span>
                    </div>

                    {/* Growth Stage */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Growth Stage</span>
                      <span className={`px-3 py-1 rounded-full text-sm ${getStageColor(crop.stage)}`}>
                        {crop.stage.charAt(0).toUpperCase() + crop.stage.slice(1)}
                      </span>
                    </div>

                    {/* Area */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Area</span>
                      <span className="text-sm">{crop.area} acres</span>
                    </div>

                    {/* Planted Date */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Planted</span>
                      <span className="text-sm">{new Date(crop.plantedDate).toLocaleDateString()}</span>
                    </div>

                    {/* Days to Harvest */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <span className="text-sm text-gray-600 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Days to Harvest
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        daysToHarvest < 0
                          ? 'bg-gray-100 text-gray-700'
                          : daysToHarvest <= 7
                          ? 'bg-orange-100 text-orange-700'
                          : daysToHarvest <= 30
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {daysToHarvest < 0 ? 'Overdue' : `${daysToHarvest} days`}
                      </span>
                    </div>

                    {/* Notes */}
                    {crop.notes && (
                      <div className="pt-3 border-t border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">Notes:</p>
                        <p className="text-sm text-gray-800">{crop.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
