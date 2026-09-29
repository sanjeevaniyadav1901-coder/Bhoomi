import { useState } from 'react';
import { Bug, AlertCircle, Shield, Upload, Bell } from 'lucide-react';
import { pestApi } from '../services/api';

interface PestDetectionProps {
  fieldId: string;
}

interface Pest {
  name: string;
  count: number;
}

interface PestData {
  pests_found: Pest[];
  severity: string;
  action_needed: string;
  timestamp?: string;
}

interface Alert {
  id: string;
  pest: string;
  count: number;
  severity: string;
  date: string;
}

export function PestDetection({ fieldId }: PestDetectionProps) {
  const [pestData, setPestData] = useState<PestData | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detectPests = async (imageFile: File) => {
    setUploading(true);
    setError(null);
    
    try {
      const data = await pestApi.detect(imageFile, fieldId);
      setPestData(data);
      await fetchAlerts();
    } catch (err) {
      setError('Failed to detect pests');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await pestApi.getAlerts(fieldId);
      setAlerts(response.alerts || []);
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch(severity?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch(severity?.toLowerCase()) {
      case 'high': return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'medium': return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default: return <Shield className="w-5 h-5 text-green-600" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <Bug className="w-6 h-6 text-red-600 mr-2" />
        Pest Detection & Early Warning
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      {/* Upload Section */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-400 transition-colors mb-6">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) detectPests(file);
          }}
          className="hidden"
          id="pest-image-upload"
          disabled={uploading}
        />
        <label htmlFor="pest-image-upload" className="cursor-pointer block">
          <Upload className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p className="text-gray-600 font-medium">
            {uploading ? 'Analyzing...' : 'Upload image for pest detection'}
          </p>
          <p className="text-sm text-gray-400">Click to upload or drag & drop</p>
        </label>
      </div>

      {/* Pest Detection Results */}
      {pestData && (
        <div className="mb-6">
          {pestData.pests_found.length > 0 ? (
            <div className={`p-4 rounded-lg border ${getSeverityColor(pestData.severity)}`}>
              <div className="flex items-center mb-3">
                {getSeverityIcon(pestData.severity)}
                <h3 className="font-semibold ml-2">
                  {pestData.pests_found.length} Pest(s) Detected!
                </h3>
                <span className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(pestData.severity)}`}>
                  {pestData.severity?.toUpperCase() || 'UNKNOWN'} PRIORITY
                </span>
              </div>
              
              <div className="space-y-2">
                {pestData.pests_found.map((pest, index) => (
                  <div key={index} className="flex justify-between items-center bg-white bg-opacity-50 p-2 rounded">
                    <span className="font-medium">{pest.name}</span>
                    <span className="text-sm text-gray-600">Count: {pest.count}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-3 p-3 bg-yellow-50 rounded border border-yellow-200">
                <span className="font-semibold">Recommended Action: </span>
                {pestData.action_needed}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-green-600 bg-green-50 rounded-lg">
              <Shield className="w-12 h-12 mx-auto mb-2 text-green-500" />
              <p className="font-medium">No pests detected. Your field is healthy!</p>
            </div>
          )}
        </div>
      )}

      {/* Alerts Section */}
      <div>
        <h3 className="font-semibold mb-3 flex items-center">
          <Bell className="w-4 h-4 mr-1" />
          Recent Alerts
        </h3>
        {loading ? (
          <div className="text-center py-4 text-gray-500">Loading alerts...</div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-4 text-gray-400">No alerts</div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {alerts.map((alert) => (
              <div key={alert.id} className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{alert.pest}</span>
                    <span className="ml-2 text-sm text-gray-600">Count: {alert.count}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${getSeverityColor(alert.severity)}`}>
                    {alert.severity?.toUpperCase()}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(alert.date).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}