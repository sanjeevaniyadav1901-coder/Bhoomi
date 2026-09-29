import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, Calendar, Droplet, Thermometer, Leaf, AlertTriangle } from 'lucide-react';
import { analyticsApi } from '../services/api';

interface AnalyticsDashboardProps {
  fieldId: string;
}

interface HistoryItem {
  date: string;
  health: number;
  yield: number;
  moisture: number;
  temperature: number;
}

interface AnalyticsData {
  health_trend: number;
  yield_forecast: number;
  forecast_confidence: number;
  risk_score: number;
  crop_growth: number;
  history: HistoryItem[];
  field_id: string;
}

export function AnalyticsDashboard({ fieldId }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
    // Refresh every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, [fieldId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await analyticsApi.getDashboardData(fieldId);
      setAnalytics(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch analytics data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevel = (score: number) => {
    if (score < 30) return { label: 'Low', color: 'text-green-600', bg: 'bg-green-100' };
    if (score < 60) return { label: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { label: 'High', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center py-8 text-gray-500">
          <div className="animate-spin inline-block rounded-full h-8 w-8 border-b-2 border-green-600 mb-4"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center py-8 text-red-500">
          <AlertTriangle className="w-12 h-12 mx-auto mb-2 text-red-400" />
          <p>{error}</p>
          <button 
            onClick={fetchAnalytics}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center py-8 text-gray-500">
          <Activity className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No analytics data available</p>
          <p className="text-sm text-gray-400 mt-1">Add soil data to see analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <Activity className="w-6 h-6 text-purple-600 mr-2" />
        Farm Analytics Dashboard
      </h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h3 className="text-sm text-gray-600">Health Trend</h3>
          <div className={`text-3xl font-bold ${getHealthColor(analytics.health_trend)}`}>
            {analytics.health_trend}%
          </div>
          <div className="flex items-center text-sm text-green-600 mt-1">
            <TrendingUp className="w-4 h-4 mr-1" />
            +2.5% this month
          </div>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
          <h3 className="text-sm text-gray-600">Yield Forecast</h3>
          <div className="text-3xl font-bold text-orange-600">
            {analytics.yield_forecast} kg/ha
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {analytics.forecast_confidence}% confidence
          </div>
        </div>

        <div className={`p-4 rounded-lg border ${getRiskLevel(analytics.risk_score).bg}`}>
          <h3 className="text-sm text-gray-600">Risk Score</h3>
          <div className={`text-3xl font-bold ${getRiskLevel(analytics.risk_score).color}`}>
            {analytics.risk_score}/100
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {getRiskLevel(analytics.risk_score).label} risk
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <h3 className="text-sm text-gray-600">Crop Growth</h3>
          <div className="text-3xl font-bold text-green-600">
            {analytics.crop_growth}%
          </div>
          <div className="text-sm text-gray-600 mt-1">
            Vegetative stage
          </div>
        </div>
      </div>

      {/* Progress Bar for Crop Growth */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Crop Growth Progress</span>
          <span>{analytics.crop_growth}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-green-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${analytics.crop_growth}%` }}
          />
        </div>
      </div>

      {/* History Table */}
      <div className="border-t pt-4">
        <h3 className="font-semibold mb-3 flex items-center">
          <Calendar className="w-4 h-4 mr-1 text-gray-500" />
          Historical Trends (Last 7 Days)
        </h3>
        
        {analytics.history && analytics.history.length > 0 ? (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {analytics.history.map((item: HistoryItem, index: number) => (
              <div key={index} className="flex items-center justify-between border-b py-2 hover:bg-gray-50 px-2 rounded transition-colors">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-600 min-w-[100px]">
                    {new Date(item.date).toLocaleDateString()}
                  </span>
                  <div className="flex items-center space-x-2">
                    <Droplet className="w-3 h-3 text-blue-500" />
                    <span className="text-sm">{item.moisture}%</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Thermometer className="w-3 h-3 text-red-500" />
                    <span className="text-sm">{item.temperature}°C</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <span className={`text-sm font-medium ${getHealthColor(item.health)}`}>
                      {item.health}%
                    </span>
                    <span className="text-xs text-gray-400">health</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-sm font-medium text-orange-600">
                      {item.yield}%
                    </span>
                    <span className="text-xs text-gray-400">yield</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-400">
            <Leaf className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p>No historical data available</p>
            <p className="text-sm">Add soil data to start tracking</p>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="bg-gray-50 p-3 rounded-lg text-center border border-gray-100">
          <span className="text-gray-600">Avg Health:</span>
          <span className="font-bold ml-1">
            {analytics.history && analytics.history.length > 0
              ? Math.round(analytics.history.reduce((sum, h) => sum + h.health, 0) / analytics.history.length)
              : 0}%
          </span>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg text-center border border-gray-100">
          <span className="text-gray-600">Avg Yield:</span>
          <span className="font-bold ml-1">
            {analytics.history && analytics.history.length > 0
              ? Math.round(analytics.history.reduce((sum, h) => sum + h.yield, 0) / analytics.history.length)
              : 0}%
          </span>
        </div>
      </div>
    </div>
  );
}