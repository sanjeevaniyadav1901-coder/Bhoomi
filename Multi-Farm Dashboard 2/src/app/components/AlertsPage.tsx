import { useState, useEffect } from 'react';
import { AlertTriangle, Cloud, CloudRain, Wind, ThermometerSun, Snowflake, Plus, Bell } from 'lucide-react';
import { WeatherAlert, Farm } from '../types';
import { getUserWeatherAlerts, getFarmWeatherAlerts, addWeatherAlert, getUserFarms } from '../services/storageService';

interface AlertsPageProps {
  userEmail: string;
  selectedFarmId: string | null;
}

export function AlertsPage({ userEmail, selectedFarmId }: AlertsPageProps) {
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [viewMode, setViewMode] = useState<'all' | 'farm'>('all');

  useEffect(() => {
    setFarms(getUserFarms(userEmail));
    
    if (viewMode === 'all') {
      setAlerts(getUserWeatherAlerts(userEmail));
    } else if (selectedFarmId) {
      setAlerts(getFarmWeatherAlerts(userEmail, selectedFarmId));
    }
  }, [userEmail, selectedFarmId, viewMode]);

  const generateMockAlert = (farmId: string) => {
    const alertTypes: WeatherAlert['type'][] = ['rain', 'drought', 'frost', 'heatwave', 'wind'];
    const severities: WeatherAlert['severity'][] = ['low', 'medium', 'high'];
    
    const mockAlerts = [
      {
        type: 'rain' as const,
        severity: 'medium' as const,
        message: 'Heavy rainfall expected in the next 24-48 hours',
        actionRequired: 'Postpone irrigation. Ensure proper drainage in fields.',
      },
      {
        type: 'drought' as const,
        severity: 'high' as const,
        message: 'Prolonged dry spell forecasted for next 7 days',
        actionRequired: 'Increase irrigation frequency. Consider mulching to retain moisture.',
      },
      {
        type: 'frost' as const,
        severity: 'high' as const,
        message: 'Temperature may drop below 5°C tonight',
        actionRequired: 'Protect sensitive crops. Consider frost covers for young plants.',
      },
      {
        type: 'heatwave' as const,
        severity: 'medium' as const,
        message: 'Temperature expected to exceed 40°C for next 3 days',
        actionRequired: 'Increase irrigation. Provide shade for sensitive crops.',
      },
      {
        type: 'wind' as const,
        severity: 'medium' as const,
        message: 'Strong winds (40-50 km/h) expected this evening',
        actionRequired: 'Secure loose equipment. Check support stakes for tall crops.',
      },
    ];

    const selected = mockAlerts[Math.floor(Math.random() * mockAlerts.length)];
    
    const newAlert: WeatherAlert = {
      id: Date.now().toString(),
      farmId,
      date: new Date().toISOString(),
      ...selected,
    };

    addWeatherAlert(userEmail, newAlert);
    
    if (viewMode === 'all') {
      setAlerts(getUserWeatherAlerts(userEmail));
    } else {
      setAlerts(getFarmWeatherAlerts(userEmail, farmId));
    }
  };

  const getAlertIcon = (type: WeatherAlert['type']) => {
    switch (type) {
      case 'rain':
        return <CloudRain className="w-6 h-6" />;
      case 'drought':
        return <ThermometerSun className="w-6 h-6" />;
      case 'frost':
        return <Snowflake className="w-6 h-6" />;
      case 'heatwave':
        return <ThermometerSun className="w-6 h-6" />;
      case 'wind':
        return <Wind className="w-6 h-6" />;
      default:
        return <Cloud className="w-6 h-6" />;
    }
  };

  const getSeverityColor = (severity: WeatherAlert['severity']) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getSeverityBg = (severity: WeatherAlert['severity']) => {
    switch (severity) {
      case 'high':
        return 'bg-red-50 border-red-200';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200';
      case 'low':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getFarmName = (farmId: string) => {
    const farm = farms.find(f => f.id === farmId);
    return farm?.name || 'Unknown Farm';
  };

  // Sort alerts by date (newest first) and severity
  const sortedAlerts = [...alerts].sort((a, b) => {
    const severityOrder = { high: 3, medium: 2, low: 1 };
    const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
    if (severityDiff !== 0) return severityDiff;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const alertCounts = {
    high: alerts.filter(a => a.severity === 'high').length,
    medium: alerts.filter(a => a.severity === 'medium').length,
    low: alerts.filter(a => a.severity === 'low').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-600 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1>Weather & Irrigation Alerts</h1>
                <div className="text-sm text-gray-500">
                  Real-time alerts and recommendations for your farms
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
        {/* Alert Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High Priority</p>
                <p className="text-2xl text-red-700">{alertCounts.high}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <Bell className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Medium Priority</p>
                <p className="text-2xl text-yellow-700">{alertCounts.medium}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Bell className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Low Priority</p>
                <p className="text-2xl text-blue-700">{alertCounts.low}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Generate Alert Button */}
        {selectedFarmId && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg mb-1">Simulate Weather Alert</h3>
                <p className="text-sm text-gray-600">
                  Generate a simulated weather alert for testing
                </p>
              </div>
              <button
                onClick={() => generateMockAlert(selectedFarmId)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Generate Alert
              </button>
            </div>
          </div>
        )}

        {/* Alerts List */}
        {sortedAlerts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl mb-2 text-gray-600">No Active Alerts</h3>
            <p className="text-gray-500">
              {viewMode === 'farm' && !selectedFarmId
                ? 'Please select a farm to view alerts'
                : 'All clear! No weather or irrigation alerts at the moment.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`bg-white rounded-lg shadow-md border-l-4 overflow-hidden ${getSeverityBg(alert.severity)}`}
              >
                <div className="p-6">
                  {/* Alert Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-3 rounded-full ${
                        alert.severity === 'high' ? 'bg-red-100 text-red-600' :
                        alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {getAlertIcon(alert.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg">{getFarmName(alert.farmId)}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm border ${getSeverityColor(alert.severity)}`}>
                            {alert.severity.toUpperCase()}
                          </span>
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                            {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {new Date(alert.date).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Alert Message */}
                  <div className="mb-4 p-4 bg-white rounded-lg border border-gray-200">
                    <p className="text-gray-800">{alert.message}</p>
                  </div>

                  {/* Action Required */}
                  <div className="p-4 bg-white rounded-lg border-l-4 border-green-600">
                    <p className="text-sm text-gray-600 mb-1">Recommended Action:</p>
                    <p className="text-gray-900">{alert.actionRequired}</p>
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
