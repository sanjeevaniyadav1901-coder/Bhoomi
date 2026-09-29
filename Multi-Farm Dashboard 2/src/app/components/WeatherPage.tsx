import { useState } from "react";
import { WeatherData, MLRecommendation } from "../types";
import {
  Cloud,
  Droplets,
  Wind,
  Thermometer,
  CloudRain,
  Search,
  MapPin,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { MLRecommendations } from "./MLRecommendations";
import { fetchWeather } from "../services/weatherApi";

interface WeatherPageProps {
  weather?: WeatherData;
  recommendations?: MLRecommendation[];
}

export function WeatherPage({
  weather,
  recommendations = [],
}: WeatherPageProps) {
  const [searchRegion, setSearchRegion] = useState("");
  const [selectedRegion, setSelectedRegion] =
    useState("Current Location");

  const [weatherData, setWeatherData] = useState<WeatherData>({
    temperature: weather?.temperature || 0,
    humidity: weather?.humidity || 0,
    windSpeed: weather?.windSpeed || 0,
    rainfall: weather?.rainfall || 0,
    rainProbability: weather?.rainProbability || 0,
    condition: weather?.condition || "",
  });

  /* ================= SAFE SEARCH ================= */
  const handleSearch = async () => {
    if (!searchRegion.trim()) return;

    const data = await fetchWeather(searchRegion);

    // SAFE ERROR HANDLING
    if (!data || (data as any).error) {
      alert((data as any)?.error || "Weather fetch failed");
      return;
    }

    setWeatherData(data as WeatherData);
    setSelectedRegion(searchRegion);
  };

  const forecastData = [
    { day: "Mon", temp: 28, rain: 20 },
    { day: "Tue", temp: 30, rain: 10 },
    { day: "Wed", temp: 27, rain: 60 },
    { day: "Thu", temp: 26, rain: 80 },
    { day: "Fri", temp: 29, rain: 30 },
    { day: "Sat", temp: 31, rain: 15 },
    { day: "Sun", temp: 32, rain: 5 },
  ];

  const weatherRecommendations = (recommendations || []).filter(
    (rec) =>
      rec.title?.toLowerCase?.().includes("rain") ||
      rec.title?.toLowerCase?.().includes("weather")
  );

  return (
    <div className="space-y-6">

      {/* SEARCH */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          Search Weather by Region
        </h3>

        <div className="flex gap-3">
          <input
            type="text"
            value={searchRegion}
            onChange={(e) => setSearchRegion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Enter city or region name..."
            className="w-full px-4 py-3 border rounded-lg"
          />

          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg"
          >
            Search
          </button>
        </div>

        <div className="mt-3 text-sm text-gray-600">
          Currently showing:
          <span className="font-medium text-blue-600">
            {" "}
            {selectedRegion}
          </span>
        </div>
      </div>

      {/* WEATHER */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="mb-4">Current Weather Conditions</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          <div className="flex flex-col items-center p-4 bg-orange-50 rounded-lg">
            <Thermometer className="w-8 h-8 text-orange-500 mb-2" />
            <div className="text-2xl">
              {weatherData.temperature}°C
            </div>
          </div>

          <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg">
            <Droplets className="w-8 h-8 text-blue-500 mb-2" />
            <div className="text-2xl">
              {weatherData.humidity}%
            </div>
          </div>

          <div className="flex flex-col items-center p-4 bg-cyan-50 rounded-lg">
            <Wind className="w-8 h-8 text-cyan-500 mb-2" />
            <div className="text-2xl">
              {weatherData.windSpeed} km/h
            </div>
          </div>

          <div className="flex flex-col items-center p-4 bg-indigo-50 rounded-lg">
            <CloudRain className="w-8 h-8 text-indigo-500 mb-2" />
            <div className="text-2xl">
              {weatherData.rainfall} mm
            </div>
          </div>

        </div>
      </div>

      {/* ML */}
      {weatherRecommendations.length > 0 && (
        <MLRecommendations recommendations={weatherRecommendations} />
      )}

      {/* CHART */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="mb-4">7-Day Forecast</h3>

        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={forecastData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line dataKey="temp" stroke="#f97316" />
            <Line dataKey="rain" stroke="#3b82f6" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ALERTS */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="mb-4">Weather Alerts</h3>

        {weatherData.temperature > 35 && (
          <div className="p-4 bg-orange-50 border-l-4 border-orange-500">
            Heat Advisory
          </div>
        )}

        {weatherData.windSpeed > 25 && (
          <div className="p-4 bg-cyan-50 border-l-4 border-cyan-500">
            High Wind Warning
          </div>
        )}

        {!(
          weatherData.temperature > 35 ||
          weatherData.windSpeed > 25
        ) && (
          <div className="text-center text-gray-500">
            No weather alerts
          </div>
        )}
      </div>

    </div>
  );
}