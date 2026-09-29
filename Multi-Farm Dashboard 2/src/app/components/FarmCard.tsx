import { Droplets, Thermometer, Activity, Zap, AlertTriangle } from 'lucide-react';
import { Zone, WeatherData } from '../types';
import { shouldDelayIrrigation } from '../utils/mockData';

interface FarmCardProps {
  zone: Zone;
  farmId: string;
  irrigationMode: 'smart' | 'manual' | 'scheduled';
  weatherData: WeatherData;
  onIrrigationToggle: (farmId: string, zoneId: string, status: boolean) => void;
}

export function FarmCard({
  zone,
  farmId,
  irrigationMode,
  weatherData,
  onIrrigationToggle
}: FarmCardProps) {

  const getMoistureColor = (level: string) => {
    switch (level) {
      case 'dry': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'wet': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-500';
      case 'scheduled': return 'bg-yellow-500';
      case 'idle': return 'bg-gray-300';
      default: return 'bg-gray-300';
    }
  };

  const isRainDelayed = shouldDelayIrrigation(
    weatherData?.rainProbability ?? 0,
    weatherData?.forecast ?? []
  );

  const showWarning =
    zone?.moistureLevel === 'dry' &&
    zone?.irrigationStatus === 'idle';

  const handleToggle = () => {
    if (irrigationMode !== 'manual') return;

    const isCurrentlyActive = zone?.irrigationStatus === 'active';
    onIrrigationToggle(farmId, zone?.id, !isCurrentlyActive);
  };

  // ✅ SAFE DATE HANDLING (FIX FOR YOUR ERROR)
  const safeLastIrrigation =
    zone?.lastIrrigation
      ? new Date(zone.lastIrrigation)
      : null;

 const safeNextScheduled =
  typeof zone?.nextScheduled === "string" || typeof zone?.nextScheduled === "number"
    ? new Date(zone.nextScheduled)
    : null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-shadow">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
            <Droplets className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{zone?.name}</h3>
            <p className="text-sm text-gray-600">{zone?.area} hectares</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getMoistureColor(zone?.moistureLevel)}`}>
            {zone?.moistureLevel?.toUpperCase()}
          </span>

          {showWarning && (
            <AlertTriangle className="w-5 h-5 text-red-500" />
          )}
        </div>
      </div>

      {/* Rain Warning */}
      {isRainDelayed && zone?.irrigationStatus !== 'idle' && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
          <Droplets className="w-4 h-4 text-blue-600" />
          <p className="text-sm text-blue-700">
            Irrigation delayed - Rain forecast: {(weatherData?.rainProbability ?? 0).toFixed(0)}%
          </p>
        </div>
      )}

      {/* Soil Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg">
          <div className="flex items-center gap-1 mb-1">
            <Droplets className="w-4 h-4 text-blue-600" />
            <span className="text-xs text-blue-700">Humidity</span>
          </div>
          <p className="font-semibold text-blue-900">
            {(zone?.soilData?.humidity ?? 0).toFixed(1)}%
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-lg">
          <div className="flex items-center gap-1 mb-1">
            <Activity className="w-4 h-4 text-purple-600" />
            <span className="text-xs text-purple-700">pH Level</span>
          </div>
          <p className="font-semibold text-purple-900">
            {(zone?.soilData?.ph ?? 0).toFixed(1)}
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-3 rounded-lg">
          <div className="flex items-center gap-1 mb-1">
            <Thermometer className="w-4 h-4 text-orange-600" />
            <span className="text-xs text-orange-700">Temp</span>
          </div>
          <p className="font-semibold text-orange-900">
            {(zone?.soilData?.temperature ?? 0).toFixed(1)}°C
          </p>
        </div>

      </div>

      {/* NPK */}
      <div className="grid grid-cols-3 gap-3 mb-4">

        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
          <p className="text-xs text-green-700 mb-1">Nitrogen (N)</p>
          <p className="font-semibold text-green-900">
            {(zone?.soilData?.nitrogen ?? 0).toFixed(0)} kg/ha
          </p>
        </div>

        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
          <p className="text-xs text-yellow-700 mb-1">Phosphorus (P)</p>
          <p className="font-semibold text-yellow-900">
            {(zone?.soilData?.phosphorus ?? 0).toFixed(0)} kg/ha
          </p>
        </div>

        <div className="bg-pink-50 p-3 rounded-lg border border-pink-200">
          <p className="text-xs text-pink-700 mb-1">Potassium (K)</p>
          <p className="font-semibold text-pink-900">
            {(zone?.soilData?.potassium ?? 0).toFixed(0)} kg/ha
          </p>
        </div>

      </div>

      {/* EC */}
      <div className="mb-4 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-600" />
            <span className="text-sm text-indigo-700">Electrical Conductivity (EC)</span>
          </div>
          <span className="font-semibold text-indigo-900">
            {(zone?.soilData?.ec ?? 0).toFixed(2)} dS/m
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">

        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${getStatusColor(zone?.irrigationStatus)} animate-pulse`}></div>
          <div>
            <p className="text-sm text-gray-600">
              Status: <span className="font-medium text-gray-900 capitalize">{zone?.irrigationStatus}</span>
            </p>

            <p className="text-xs text-gray-500">
              Last: {safeLastIrrigation ? safeLastIrrigation.toLocaleTimeString() : '--'}
            </p>
          </div>
        </div>

        {irrigationMode === 'manual' && (
          <button
            onClick={handleToggle}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              zone?.irrigationStatus === 'active'
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {zone?.irrigationStatus === 'active' ? 'Stop' : 'Start'}
          </button>
        )}

        {irrigationMode === 'smart' && (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium">
            Auto Mode
          </span>
        )}

        {irrigationMode === 'scheduled' && safeNextScheduled && (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-medium">
            Next: {safeNextScheduled.toLocaleTimeString()}
          </span>
        )}

      </div>
    </div>
  );
}