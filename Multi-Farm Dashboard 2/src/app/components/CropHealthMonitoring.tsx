import { useState, useEffect } from 'react';
import { Leaf, AlertTriangle, Upload, CheckCircle } from 'lucide-react';

interface CropHealthProps {
  fieldId: string;
}

interface HealthData {
  disease: string;
  confidence: number;
  severity: string;
  overall_health_score: number;
  stage?: string;
  progress?: number;
  timestamp?: string;
  nutrient_deficiency?: string | null;
}

interface HistoryRecord {
  id: string;
  disease: string;
  severity: string;
  health_score: number;
  date: string;
}

export function CropHealthMonitoring({ fieldId }: CropHealthProps) {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');

  const API_BASE = 'http://127.0.0.1:5000';

  useEffect(() => {
    if (fieldId) {
      fetchHistory();
    }
  }, [fieldId]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE}/api/crop-health/history/${fieldId}`);
      
      console.log('History Response Status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('History Data:', data);
      setHistory(data.history || []);
    } catch (err: any) {
      console.error('Error fetching history:', err);
      setError(`Failed to fetch history: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const analyzeImage = async (imageFile: File) => {
    setUploading(true);
    setError(null);
    setDebugInfo('Starting analysis...');
    
    try {
      // Create FormData
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('field_id', fieldId);
      formData.append('crop_type', 'Unknown');
      formData.append('user_id', 'test_user');

      setDebugInfo('Sending request to backend...');
      
      // Make the API call
      const response = await fetch(`${API_BASE}/api/crop-health/analyze`, {
        method: 'POST',
        body: formData,
      });

      setDebugInfo(`Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        setDebugInfo(`Error response: ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('Analysis Result:', data);
      setDebugInfo('Analysis complete!');
      
      // Map the response to our HealthData interface
      const mappedData: HealthData = {
        disease: data.disease || 'Unknown',
        confidence: data.confidence || 0,
        severity: data.severity || 'unknown',
        overall_health_score: data.overall_health_score || 0,
        stage: data.stage || data.growth_stage || 'Unknown',
        progress: data.progress || 0,
        nutrient_deficiency: data.nutrient_deficiency || null,
        timestamp: data.timestamp || new Date().toISOString()
      };
      
      setHealthData(mappedData);
      setDebugInfo('Analysis complete! Data mapped successfully.');
      
      // Refresh history after analysis
      await fetchHistory();
      
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(`Failed to analyze crop health: ${err.message}`);
      setDebugInfo(`Error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch(severity?.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getHealthStatus = (score: number) => {
    if (score >= 80) return { label: 'Excellent', color: 'text-green-600' };
    if (score >= 60) return { label: 'Good', color: 'text-yellow-600' };
    if (score >= 40) return { label: 'Fair', color: 'text-orange-600' };
    return { label: 'Needs Attention', color: 'text-red-600' };
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <Leaf className="w-6 h-6 text-green-600 mr-2" />
        Crop Health Monitoring
      </h2>

      {/* Debug Info */}
      {debugInfo && (
        <div className="mb-4 p-3 bg-blue-50 text-blue-600 rounded-lg text-sm">
          <strong>Debug:</strong> {debugInfo}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg border border-red-200">
          <strong>❌ Error:</strong> {error}
        </div>
      )}

      {/* Health Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <h3 className="font-semibold text-gray-600 text-sm">Overall Health</h3>
          {healthData ? (
            <>
              <div className={`text-3xl font-bold ${getHealthColor(healthData.overall_health_score)}`}>
                {healthData.overall_health_score}%
              </div>
              <div className={`text-sm ${getHealthStatus(healthData.overall_health_score).color}`}>
                {getHealthStatus(healthData.overall_health_score).label}
              </div>
            </>
          ) : (
            <div className="text-gray-400">No data yet</div>
          )}
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h3 className="font-semibold text-gray-600 text-sm">Growth Stage</h3>
          <div className="text-2xl font-bold text-blue-600">
            {healthData?.stage || 'Unknown'}
          </div>
          <div className="text-sm text-gray-600">
            {healthData?.progress || 0}% progress
          </div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <h3 className="font-semibold text-gray-600 text-sm">Disease Status</h3>
          <div className={`text-2xl font-bold ${
            healthData?.disease === 'Healthy' || healthData?.disease === 'None' 
              ? 'text-green-600' 
              : healthData?.disease && healthData.disease !== 'Unknown'
              ? 'text-red-600'
              : 'text-gray-400'
          }`}>
            {healthData?.disease || 'Unknown'}
          </div>
          <div className="text-sm text-gray-600">
            {healthData?.confidence || 0}% confidence
          </div>
          {healthData?.nutrient_deficiency && (
            <div className="text-sm text-orange-600 mt-1 font-medium">
              ⚠️ Deficiency: {healthData.nutrient_deficiency}
            </div>
          )}
        </div>
      </div>

      {/* Upload Section */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              console.log('File selected:', file.name, file.type, file.size);
              analyzeImage(file);
            }
          }}
          className="hidden"
          id="crop-image-upload"
          disabled={uploading}
        />
        <label htmlFor="crop-image-upload" className="cursor-pointer block">
          <Upload className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p className="text-gray-600 font-medium">
            {uploading ? 'Analyzing...' : 'Upload leaf/plant image for analysis'}
          </p>
          <p className="text-sm text-gray-400">
            {uploading ? 'Please wait...' : 'Click to upload or drag & drop'}
          </p>
          {uploading && (
            <div className="mt-3 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          )}
        </label>
      </div>

      {/* Results */}
      {healthData && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-semibold mb-3 flex items-center">
            <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
            Analysis Results
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center py-1 border-b border-gray-100">
              <span className="text-gray-600">Disease:</span>
              <span className={`font-medium ${
                healthData.disease === 'Healthy' || healthData.disease === 'None' 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {healthData.disease} ({healthData.confidence}% confidence)
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-gray-100">
              <span className="text-gray-600">Severity:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(healthData.severity)}`}>
                {healthData.severity?.toUpperCase() || 'Unknown'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-gray-100">
              <span className="text-gray-600">Growth Stage:</span>
              <span className="font-medium">{healthData.stage}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-600">Overall Health:</span>
              <span className={`font-medium ${getHealthColor(healthData.overall_health_score)}`}>
                {healthData.overall_health_score}% - {getHealthStatus(healthData.overall_health_score).label}
              </span>
            </div>
            {healthData.nutrient_deficiency && (
              <div className="flex justify-between items-center py-1 border-t border-orange-200 mt-2 pt-2">
                <span className="text-gray-600">Nutrient Deficiency:</span>
                <span className="font-medium text-orange-600">
                  {healthData.nutrient_deficiency}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="mt-6">
          <h4 className="font-semibold mb-3 text-gray-700">Recent History</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {history.slice(0, 5).map((record) => (
              <div key={record.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <span className={`w-2 h-2 rounded-full ${
                    record.severity === 'high' ? 'bg-red-500' :
                    record.severity === 'medium' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`} />
                  <span className="font-medium">{record.disease}</span>
                  <span className={`text-xs px-2 py-1 rounded ${getSeverityColor(record.severity)}`}>
                    {record.severity}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  Score: {record.health_score}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center py-4 text-gray-500">
          <div className="animate-spin inline-block rounded-full h-5 w-5 border-b-2 border-green-600 mr-2"></div>
          Loading history...
        </div>
      )}

      {/* Empty state */}
      {!healthData && !loading && !error && (
        <div className="text-center py-8 text-gray-400">
          <Leaf className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>Upload an image to analyze crop health</p>
        </div>
      )}
    </div>
  );
}