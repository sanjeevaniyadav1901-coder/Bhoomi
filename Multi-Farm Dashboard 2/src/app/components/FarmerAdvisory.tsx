import { useState, useEffect } from 'react';
import { Bell, CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { advisoryApi } from '../services/api';

interface FarmerAdvisoryProps {
  fieldId: string;
}

interface Advisory {
  id: string;
  type: string;
  priority: string;
  message: string;
  action: string;
  created_at: string;
}

export function FarmerAdvisory({ fieldId }: FarmerAdvisoryProps) {
  const [advisories, setAdvisories] = useState<Advisory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAdvisories();
    const interval = setInterval(fetchAdvisories, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, [fieldId]);

  const fetchAdvisories = async () => {
    try {
      setLoading(true);
      const data = await advisoryApi.getAdvisories(fieldId);
      setAdvisories(data.advisories || []);
    } catch (err) {
      setError('Failed to fetch advisories');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (advisoryId: string) => {
    try {
      await advisoryApi.markAsRead(advisoryId);
      setAdvisories(advisories.filter(a => a.id !== advisoryId));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority?.toLowerCase()) {
      case 'high': return 'bg-red-50 border-red-300 text-red-800';
      case 'medium': return 'bg-yellow-50 border-yellow-300 text-yellow-800';
      case 'low': return 'bg-green-50 border-green-300 text-green-800';
      default: return 'bg-gray-50 border-gray-300 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch(priority?.toLowerCase()) {
      case 'high': return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'medium': return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'low': return <CheckCircle className="w-5 h-5 text-green-600" />;
      default: return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return colors[priority?.toLowerCase() as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type: string) => {
    switch(type?.toLowerCase()) {
      case 'irrigation': return '💧';
      case 'disease': return '🌿';
      case 'pest': return '🐛';
      case 'weather': return '🌤️';
      default: return '📋';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <Bell className="w-6 h-6 text-blue-600 mr-2" />
        Farmer Advisory System
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading advisories...</div>
      ) : advisories.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">✅</div>
          <p className="text-green-600 font-medium">No pending advisories</p>
          <p className="text-sm text-gray-500">Your farm is in good condition</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="mb-3 text-sm text-gray-500">
            {advisories.length} pending advisory(ies)
          </div>
          {advisories.map((advisory) => (
            <div key={advisory.id} className={`border rounded-lg p-4 ${getPriorityColor(advisory.priority)} relative`}>
              <button
                onClick={() => markAsRead(advisory.id)}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="flex items-start">
                <div className="mr-3 text-2xl">
                  {getTypeIcon(advisory.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center flex-wrap gap-2 mb-1">
                    <h4 className="font-semibold capitalize">{advisory.type}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityBadge(advisory.priority)}`}>
                      {advisory.priority?.toUpperCase() || 'NORMAL'}
                    </span>
                  </div>
                  <p className="text-gray-700">{advisory.message}</p>
                  <p className="text-sm text-gray-600 mt-2">
                    <span className="font-medium">Action:</span> {advisory.action}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(advisory.created_at).toLocaleString()}
                  </p>
                </div>
                {getPriorityIcon(advisory.priority)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Stats */}
      {advisories.length > 0 && (
        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="bg-red-50 p-2 rounded-lg text-center">
            <div className="text-lg font-bold text-red-600">
              {advisories.filter(a => a.priority === 'high').length}
            </div>
            <div className="text-xs text-gray-600">High Priority</div>
          </div>
          <div className="bg-yellow-50 p-2 rounded-lg text-center">
            <div className="text-lg font-bold text-yellow-600">
              {advisories.filter(a => a.priority === 'medium').length}
            </div>
            <div className="text-xs text-gray-600">Medium Priority</div>
          </div>
          <div className="bg-green-50 p-2 rounded-lg text-center">
            <div className="text-lg font-bold text-green-600">
              {advisories.filter(a => a.priority === 'low').length}
            </div>
            <div className="text-xs text-gray-600">Low Priority</div>
          </div>
        </div>
      )}
    </div>
  );
}