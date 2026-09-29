import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { SoilData } from '../types';
import { Droplet, TestTube, Zap } from 'lucide-react';

interface SoilParametersProps {
  soilData: SoilData;
}

/* ✅ ADD THIS TYPE */
type Parameter = {
  name: string;
  value: number;
  unit: string;
  optimal: [number, number]; // fixed tuple
  color: string;
};

export function SoilParameters({ soilData }: SoilParametersProps) {

  /* ✅ FIXED: explicit typing */
  const parameters: Parameter[] = [
    { name: 'N', value: soilData.nitrogen, unit: 'mg/kg', optimal: [20, 50], color: '#3b82f6' },
    { name: 'P', value: soilData.phosphorus, unit: 'mg/kg', optimal: [15, 40], color: '#8b5cf6' },
    { name: 'K', value: soilData.potassium, unit: 'mg/kg', optimal: [100, 300], color: '#ec4899' },
  ];

  const getStatusColor = (value: number, optimal: [number, number]) => {
    if (value < optimal[0]) return 'text-red-600';
    if (value > optimal[1]) return 'text-orange-600';
    return 'text-green-600';
  };

  const getStatusText = (value: number, optimal: [number, number]) => {
    if (value < optimal[0]) return 'Low';
    if (value > optimal[1]) return 'High';
    return 'Optimal';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* NPK Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="mb-4 flex items-center gap-2">
          <TestTube className="w-5 h-5" />
          NPK Levels
        </h3>

        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={parameters}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />

            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {parameters.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>

          </BarChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-3 gap-4 mt-4">
          {parameters.map((param) => (
            <div key={param.name} className="text-center">

              <div className="text-xs text-gray-500">
                {param.name === 'N' && 'Nitrogen'}
                {param.name === 'P' && 'Phosphorus'}
                {param.name === 'K' && 'Potassium'}
              </div>

              <div className={getStatusColor(param.value, param.optimal)}>
                {getStatusText(param.value, param.optimal)}
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* Other Parameters */}
      <div className="bg-white rounded-lg shadow p-6">

        <h3 className="mb-4">Soil Conditions</h3>

        <div className="space-y-4">

          {/* Moisture */}
          <div className="flex items-center justify-between">

            <div className="flex items-center gap-2">
              <Droplet className="w-5 h-5 text-blue-500" />
              <span>Soil Moisture</span>
            </div>

            <div className="flex items-center gap-2">

              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: `${soilData.moisture}%` }}
                />
              </div>

              <span className="w-12 text-right">
                {soilData.moisture}%
              </span>

            </div>

          </div>

          {/* Humidity */}
          <div className="flex items-center justify-between">

            <div className="flex items-center gap-2">
              <Droplet className="w-5 h-5 text-cyan-500" />
              <span>Humidity</span>
            </div>

            <div className="flex items-center gap-2">

              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-500 transition-all"
                  style={{ width: `${soilData.humidity}%` }}
                />
              </div>

              <span className="w-12 text-right">
                {soilData.humidity}%
              </span>

            </div>

          </div>

          {/* pH */}
          <div className="flex items-center justify-between">

            <div className="flex items-center gap-2">
              <TestTube className="w-5 h-5 text-purple-500" />
              <span>pH Level</span>
            </div>

            <div className="flex items-center gap-2">

              <div className="w-32 h-8 bg-gradient-to-r from-red-500 via-green-500 to-blue-500 rounded relative">

                <div
                  className="absolute top-0 bottom-0 w-1 bg-white shadow"
                  style={{ left: `${((soilData.ph - 0) / 14) * 100}%` }}
                />

              </div>

              <span className="w-12 text-right">
                {soilData.ph.toFixed(1)}
              </span>

            </div>

          </div>

          {/* EC */}
          <div className="flex items-center justify-between">

            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span>EC (Conductivity)</span>
            </div>

            <span>
              {soilData.ec.toFixed(2)} dS/m
            </span>

          </div>

        </div>

      </div>

    </div>
  );
}