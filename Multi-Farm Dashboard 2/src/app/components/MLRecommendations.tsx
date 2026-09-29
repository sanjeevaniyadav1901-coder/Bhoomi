import { MLRecommendation } from '../types';
import { Sparkles, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface MLRecommendationsProps {
  recommendations: MLRecommendation[];
}

export function MLRecommendations({ recommendations }: MLRecommendationsProps) {

const safeRecommendations = recommendations.map((rec, index) => ({
  id: (rec as any).id ?? index.toString(),
  title: rec.title,
  message: (rec as any).message ?? rec.description ?? '',
  priority: rec.priority as 'high' | 'medium' | 'low',
  confidence: (rec as any).confidence ?? 80
}));
  function getPriorityIcon(priority: 'high' | 'medium' | 'low') {
    switch (priority) {
      case 'high': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'medium': return <Info className="w-5 h-5 text-yellow-500" />;
      case 'low': return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  }

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-green-500 bg-green-50';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="mb-4 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-purple-500" />
        ML Recommendations
      </h3>

      <div className="space-y-3">
        {safeRecommendations.map((rec) => (
          <div
            key={rec.id}
            className={`p-4 border-l-4 rounded-r-lg ${getPriorityColor(rec.priority)}`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                {getPriorityIcon(rec.priority)}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span>{rec.title}</span>
                  <span className="text-xs px-2 py-0.5 bg-white rounded-full">
                    {rec.priority}
                  </span>
                </div>

                <div className="text-sm text-gray-700">
                  {rec.message}
                </div>

                <div className="text-xs text-gray-500 mt-2">
                  Confidence: {rec.confidence}%
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {safeRecommendations.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
          <div>All systems optimal</div>
          <div className="text-sm">No recommendations at this time</div>
        </div>
      )}
    </div>
  );
}