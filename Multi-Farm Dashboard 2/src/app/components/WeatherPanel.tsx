import { WeatherData } from '../types';
import { Cloud, Droplets, Wind, Thermometer, CloudRain } from 'lucide-react';

interface WeatherPanelProps {
  weather: any; // 🔥 changed to any to accept API response
}

export function WeatherPanel({ weather }: WeatherPanelProps) {

  // ✅ Transform backend data → UI format
  const formattedWeather: WeatherData = {
  temperature: weather?.main?.temp ?? weather?.temperature ?? 0,
  humidity: weather?.main?.humidity ?? weather?.humidity ?? 0,
  windSpeed: weather?.wind?.speed ?? weather?.windSpeed ?? 0,
  rainfall: weather?.rainfall ?? 0,
  rainProbability: weather?.rainProbability ?? 0,

  // ✅ FIXED
  condition: weather?.condition ?? weather?.weather?.[0]?.description ?? "N/A",
};

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="mb-4">Weather Conditions</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        {/* Temperature */}
        <div className="flex flex-col items-center p-4 bg-orange-50 rounded-lg">
          <Thermometer className="w-8 h-8 text-orange-500 mb-2" />
          <div className="text-2xl">{formattedWeather.temperature}°C</div>
          <div className="text-xs text-gray-600">Temperature</div>
        </div>

        {/* Humidity */}
        <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg">
          <Droplets className="w-8 h-8 text-blue-500 mb-2" />
          <div className="text-2xl">{formattedWeather.humidity}%</div>
          <div className="text-xs text-gray-600">Humidity</div>
        </div>

        {/* Wind */}
        <div className="flex flex-col items-center p-4 bg-cyan-50 rounded-lg">
          <Wind className="w-8 h-8 text-cyan-500 mb-2" />
          <div className="text-2xl">{formattedWeather.windSpeed}</div>
          <div className="text-xs text-gray-600">km/h Wind</div>
        </div>

        {/* Rainfall */}
        <div className="flex flex-col items-center p-4 bg-indigo-50 rounded-lg">
          <CloudRain className="w-8 h-8 text-indigo-500 mb-2" />
          <div className="text-2xl">{formattedWeather.rainfall}</div>
          <div className="text-xs text-gray-600">mm Rainfall</div>
        </div>

      </div>

      {/* Forecast */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Cloud className="w-5 h-5 text-gray-600" />
          <span>24h Forecast</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Rain Probability:</span>
          <span className={`${formattedWeather.rainProbability > 50 ? 'text-blue-600' : 'text-gray-700'}`}>
            {formattedWeather.rainProbability}%
          </span>
        </div>

        {formattedWeather.rainProbability > 50 && (
          <div className="mt-2 p-2 bg-blue-100 text-blue-800 rounded text-sm">
            ⚠️ High rain probability - Irrigation may be delayed
          </div>
        )}
      </div>
    </div>
  );
}