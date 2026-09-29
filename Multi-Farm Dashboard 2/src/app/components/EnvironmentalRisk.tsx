import { useState, useEffect } from 'react';
import { AlertTriangle, CloudRain, Sun, Wind, Droplet } from 'lucide-react';
import { environmentalRiskApi } from '../services/api';

interface EnvironmentalRiskProps {
  fieldId: string;
}

interface Risk {
  type: string;
  severity: string;
  probability: number;
  action: string;
}

export function EnvironmentalRisk({ fieldId }: EnvironmentalRiskProps) {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRisks();
    const interval = setInterval(fetchRisks, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, [fieldId]);

  const fetchRisks = async () => {
    try {
      setLoading(true);
      const data = await environmentalRiskApi.getRisks(fieldId);
      setRisks(data.risks || []);
    } catch (err) {
      setError('Failed to fetch environmental risks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskIcon = (type: string) => {
    switch(type?.toLowerCase()) {
      case 'drought': return <Sun className="w-6 h-6 text-yellow-600" />;
      case 'flood': return <CloudRain className="w-6 h-6 text-blue-600" />;
      case 'heat_stress': return <Sun className="w-6 h-6 text-red-600" />;
      case 'disease_outbreak': return <AlertTriangle className="w-6 h-6 text-orange-600" />;
      default: return <AlertTriangle className="w-6 h-6 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch(severity?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getSeverityBadge = (severity: string) => {
    const colors = {
      high: 'bg-red-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500'
    };
    return colors[severity?.toLowerCase() as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <AlertTriangle className="w-6 h-6 text-orange-600 mr-2" />
        Environmental Risk Monitoring
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading risks...</div>
      ) : risks.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">✅</div>
          <p className="text-green-600 font-medium">No environmental risks detected</p>
          <p className="text-sm text-gray-500">All conditions are normal</p>
        </div>
      ) : (
        <div className="space-y-4">
          {risks.map((risk, index) => (
            <div key={index} className={`border rounded-lg p-4 ${getSeverityColor(risk.severity)}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {getRiskIcon(risk.type)}
                  <div>
                    <h4 className="font-semibold capitalize">
                      {risk.type?.replace('_', ' ')} Risk
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">{risk.action}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${getSeverityBadge(risk.severity)}`}>
                    {risk.severity?.toUpperCase() || 'UNKNOWN'}
                  </span>
                  {risk.probability && (
                    <span className="text-xs text-gray-500 mt-1">
                      {(risk.probability * 100).toFixed(0)}% probability
                    </span>
                  )}
                </div>
              </div>
              {risk.probability && (
                <div className="mt-3">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        risk.severity === 'high' ? 'bg-red-500' :
                        risk.severity === 'medium' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${risk.probability * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Quick Stats */}
      {risks.length > 0 && (
        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="bg-red-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-600">
              {risks.filter(r => r.severity === 'high').length}
            </div>
            <div className="text-xs text-gray-600">High Priority</div>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {risks.filter(r => r.severity === 'medium').length}
            </div>
            <div className="text-xs text-gray-600">Medium Priority</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">
              {risks.filter(r => r.severity === 'low').length}
            </div>
            <div className="text-xs text-gray-600">Low Priority</div>
          </div>
        </div>
      )}
    </div>
  );
}