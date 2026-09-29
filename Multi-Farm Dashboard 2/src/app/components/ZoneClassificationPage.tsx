import { MLRecommendation } from '../types';
import { Zone } from "../services/weatherApi";
import { Droplet, MapPin, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { MLRecommendations } from './MLRecommendations';

interface ZoneClassificationPageProps {
  zones: Zone[];
  recommendations: MLRecommendation[];
}

export function ZoneClassificationPage({ zones, recommendations }: ZoneClassificationPageProps) {
  const getZoneColor = (status: 'dry' | 'medium' | 'wet') => {
    switch (status) {
      case 'dry': return 'bg-red-100 border-red-300 text-red-800';
      case 'medium': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'wet': return 'bg-green-100 border-green-300 text-green-800';
    }
  };

  const getZoneIcon = (status: 'dry' | 'medium' | 'wet') => {
    switch (status) {
      case 'dry': return <Droplet className="w-4 h-4" />;
      case 'medium': return <Droplet className="w-4 h-4 fill-current" style={{ opacity: 0.5 }} />;
      case 'wet': return <Droplet className="w-4 h-4 fill-current" />;
    }
  };

  const dryZones = zones.filter(z => z.status === 'dry');
  const mediumZones = zones.filter(z => z.status === 'medium');
  const wetZones = zones.filter(z => z.status === 'wet');

  // Data for pie chart
  const pieData = [
    { name: 'Dry Zones', value: dryZones.length, color: '#ef4444' },
    { name: 'Medium Zones', value: mediumZones.length, color: '#eab308' },
    { name: 'Wet Zones', value: wetZones.length, color: '#22c55e' },
  ];

  // Data for bar chart
  const barData = zones.map(zone => ({
    name: zone.name,
    moisture: zone.moisture,
    fill: zone.status === 'dry' ? '#ef4444' : zone.status === 'medium' ? '#eab308' : '#22c55e'
  }));

  // Filter zone-related recommendations
  const zoneRecommendations = recommendations.filter(rec => 
    rec.title.toLowerCase().includes('zone') || 
    rec.title.toLowerCase().includes('dry') ||
    rec.title.toLowerCase().includes('moisture')
  );

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <Droplet className="w-12 h-12 text-red-600 mx-auto mb-2" />
            <div className="text-3xl text-red-600 mb-1">{dryZones.length}</div>
            <div className="text-sm text-gray-600">Dry Zones</div>
            <div className="text-xs text-red-600 mt-2">Needs Immediate Irrigation</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <Droplet className="w-12 h-12 text-yellow-600 mx-auto mb-2" style={{ opacity: 0.7 }} />
            <div className="text-3xl text-yellow-600 mb-1">{mediumZones.length}</div>
            <div className="text-sm text-gray-600">Medium Zones</div>
            <div className="text-xs text-yellow-600 mt-2">Monitor Regularly</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Droplet className="w-12 h-12 text-green-600 mx-auto mb-2 fill-current" />
            <div className="text-3xl text-green-600 mb-1">{wetZones.length}</div>
            <div className="text-sm text-gray-600">Wet Zones</div>
            <div className="text-xs text-green-600 mt-2">Optimal Moisture</div>
          </div>
        </div>
      </div>

      {/* Zone-related ML Recommendations */}
      {zoneRecommendations.length > 0 && (
        <MLRecommendations recommendations={zoneRecommendations} />
      )}

      {/* Zone Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="mb-4">Zone Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="mb-4">Moisture Levels by Zone</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="moisture" radius={[8, 8, 0, 0]}>
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Zone Grid View */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Zone Grid View
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {zones.map((zone) => (
            <div
              key={zone.id}
              className={`p-4 rounded-lg border-2 ${getZoneColor(zone.status)} hover:shadow-lg transition-shadow cursor-pointer`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">{zone.name}</span>
                {getZoneIcon(zone.status)}
              </div>
              <div className="text-lg mb-1">{zone.moisture}%</div>
              <div className="text-xs capitalize">{zone.status}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Zone List */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="mb-4">Zone Details</h3>
        <div className="space-y-3">
          {/* Dry Zones */}
          {dryZones.length > 0 && (
            <div>
              <h4 className="text-sm text-red-600 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Dry Zones - Immediate Attention Required
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {dryZones.map((zone) => (
                  <div key={zone.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{zone.name}</span>
                      <Droplet className="w-4 h-4 text-red-600" />
                    </div>
                    <div className="text-sm text-gray-600">Moisture: {zone.moisture}%</div>
                    <div className="mt-2 text-xs text-red-700">⚠️ Start irrigation soon</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Medium Zones */}
          {mediumZones.length > 0 && (
            <div>
              <h4 className="text-sm text-yellow-600 mb-2">Medium Zones - Monitor Closely</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {mediumZones.map((zone) => (
                  <div key={zone.id} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{zone.name}</span>
                      <Droplet className="w-4 h-4 text-yellow-600" style={{ opacity: 0.7 }} />
                    </div>
                    <div className="text-sm text-gray-600">Moisture: {zone.moisture}%</div>
                    <div className="mt-2 text-xs text-yellow-700">👀 Keep monitoring</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Wet Zones */}
          {wetZones.length > 0 && (
            <div>
              <h4 className="text-sm text-green-600 mb-2">Wet Zones - Optimal Condition</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {wetZones.map((zone) => (
                  <div key={zone.id} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{zone.name}</span>
                      <Droplet className="w-4 h-4 text-green-600 fill-current" />
                    </div>
                    <div className="text-sm text-gray-600">Moisture: {zone.moisture}%</div>
                    <div className="mt-2 text-xs text-green-700">✓ Good condition</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
