import { useState, useEffect } from 'react';
import { FileText, Download, Calendar, BarChart3 } from 'lucide-react';
import { Farm, SoilRecord, Crop, FertilizerAdvice } from '../types';
import { getUserFarms, getFarmSoilRecords, getFarmCrops, getFarmFertilizerAdvice } from '../services/storageService';

interface HistoryReportsPageProps {
  userEmail: string;
  selectedFarmId: string | null;
}

export function HistoryReportsPage({ userEmail, selectedFarmId }: HistoryReportsPageProps) {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [reportFarmId, setReportFarmId] = useState(selectedFarmId || '');
  const [soilRecords, setSoilRecords] = useState<SoilRecord[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [fertilizerAdvice, setFertilizerAdvice] = useState<FertilizerAdvice[]>([]);
  const [activeTab, setActiveTab] = useState<'soil' | 'crops' | 'fertilizer'>('soil');

  useEffect(() => {
    setFarms(getUserFarms(userEmail));
  }, [userEmail]);

  useEffect(() => {
    if (reportFarmId) {
      setSoilRecords(getFarmSoilRecords(userEmail, reportFarmId));
      setCrops(getFarmCrops(userEmail, reportFarmId));
      setFertilizerAdvice(getFarmFertilizerAdvice(userEmail, reportFarmId));
    } else {
      setSoilRecords([]);
      setCrops([]);
      setFertilizerAdvice([]);
    }
  }, [userEmail, reportFarmId]);

  useEffect(() => {
    if (selectedFarmId) {
      setReportFarmId(selectedFarmId);
    }
  }, [selectedFarmId]);

  const selectedFarm = farms.find(f => f.id === reportFarmId);

  const exportReport = () => {
    const reportData = {
      farm: selectedFarm,
      soilRecords: soilRecords.map(r => ({
        date: r.recordDate,
        nitrogen: r.nitrogen,
        phosphorus: r.phosphorus,
        potassium: r.potassium,
        ec: r.ec,
        humidity: r.humidity,
        ph: r.ph,
        moisture: r.moisture,
        notes: r.notes,
      })),
      crops: crops.map(c => ({
        name: c.name,
        variety: c.variety,
        plantedDate: c.plantedDate,
        expectedHarvestDate: c.expectedHarvestDate,
        stage: c.stage,
        health: c.health,
        area: c.area,
      })),
      fertilizerAdvice: fertilizerAdvice.map(f => ({
        date: f.date,
        recommendation: f.recommendation,
        npkRatio: f.npkRatio,
        quantity: f.quantity,
        applicationMethod: f.applicationMethod,
        timing: f.timing,
      })),
      generatedAt: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedFarm?.name || 'farm'}_report_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-600 rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1>History Reports</h1>
                <div className="text-sm text-gray-500">
                  View historical data and generate reports
                </div>
              </div>
            </div>
            {reportFarmId && (
              <button
                onClick={exportReport}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export Report
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Farm Selection */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <label className="text-sm mb-2 block text-gray-700">
            Select Farm for Report
          </label>
          <select
            value={reportFarmId}
            onChange={(e) => setReportFarmId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Choose a farm</option>
            {farms.map((farm) => (
              <option key={farm.id} value={farm.id}>
                {farm.name} - {farm.location}
              </option>
            ))}
          </select>
        </div>

        {reportFarmId ? (
          <>
            {/* Farm Summary */}
            {selectedFarm && (
              <div className="mb-6 bg-white rounded-lg shadow p-6">
                <h2 className="text-xl mb-4">Farm Summary</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Farm Name</p>
                    <p className="text-lg">{selectedFarm.name}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Location</p>
                    <p className="text-lg">{selectedFarm.location}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Total Area</p>
                    <p className="text-lg">{selectedFarm.area} acres</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Navigation */}
            <div className="mb-6 bg-white rounded-lg shadow p-2">
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setActiveTab('soil')}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${
                    activeTab === 'soil'
                      ? 'bg-green-600 text-white shadow-md'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <BarChart3 className="w-5 h-5" />
                  <span>Soil Records</span>
                </button>

                <button
                  onClick={() => setActiveTab('crops')}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${
                    activeTab === 'crops'
                      ? 'bg-green-600 text-white shadow-md'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Calendar className="w-5 h-5" />
                  <span>Crop History</span>
                </button>

                <button
                  onClick={() => setActiveTab('fertilizer')}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${
                    activeTab === 'fertilizer'
                      ? 'bg-green-600 text-white shadow-md'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  <span>Fertilizer Advice</span>
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'soil' && (
              <div className="bg-white rounded-lg shadow">
                {soilRecords.length === 0 ? (
                  <div className="p-12 text-center">
                    <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl mb-2 text-gray-600">No Soil Records</h3>
                    <p className="text-gray-500">No soil data records found for this farm</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs uppercase text-gray-600">Date</th>
                          <th className="px-4 py-3 text-left text-xs uppercase text-gray-600">N</th>
                          <th className="px-4 py-3 text-left text-xs uppercase text-gray-600">P</th>
                          <th className="px-4 py-3 text-left text-xs uppercase text-gray-600">K</th>
                          <th className="px-4 py-3 text-left text-xs uppercase text-gray-600">pH</th>
                          <th className="px-4 py-3 text-left text-xs uppercase text-gray-600">EC</th>
                          <th className="px-4 py-3 text-left text-xs uppercase text-gray-600">Moisture</th>
                          <th className="px-4 py-3 text-left text-xs uppercase text-gray-600">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {soilRecords.map((record) => (
                          <tr key={record.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm">
                              {new Date(record.recordDate).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-sm">{record.nitrogen}</td>
                            <td className="px-4 py-3 text-sm">{record.phosphorus}</td>
                            <td className="px-4 py-3 text-sm">{record.potassium}</td>
                            <td className="px-4 py-3 text-sm">{record.ph}</td>
                            <td className="px-4 py-3 text-sm">{record.ec}</td>
                            <td className="px-4 py-3 text-sm">{record.moisture}%</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{record.notes || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'crops' && (
              <div className="bg-white rounded-lg shadow">
                {crops.length === 0 ? (
                  <div className="p-12 text-center">
                    <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl mb-2 text-gray-600">No Crop History</h3>
                    <p className="text-gray-500">No crops found for this farm</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs uppercase text-gray-600">Crop</th>
                          <th className="px-4 py-3 text-left text-xs uppercase text-gray-600">Variety</th>
                          <th className="px-4 py-3 text-left text-xs uppercase text-gray-600">Planted</th>
                          <th className="px-4 py-3 text-left text-xs uppercase text-gray-600">Harvest</th>
                          <th className="px-4 py-3 text-left text-xs uppercase text-gray-600">Stage</th>
                          <th className="px-4 py-3 text-left text-xs uppercase text-gray-600">Health</th>
                          <th className="px-4 py-3 text-left text-xs uppercase text-gray-600">Area</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {crops.map((crop) => (
                          <tr key={crop.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm">{crop.name}</td>
                            <td className="px-4 py-3 text-sm">{crop.variety}</td>
                            <td className="px-4 py-3 text-sm">
                              {new Date(crop.plantedDate).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {new Date(crop.expectedHarvestDate).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                                {crop.stage}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`px-2 py-1 rounded text-xs ${
                                crop.health === 'excellent' ? 'bg-green-100 text-green-700' :
                                crop.health === 'good' ? 'bg-blue-100 text-blue-700' :
                                crop.health === 'fair' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {crop.health}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">{crop.area} acres</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'fertilizer' && (
              <div className="space-y-4">
                {fertilizerAdvice.length === 0 ? (
                  <div className="bg-white rounded-lg shadow p-12 text-center">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl mb-2 text-gray-600">No Fertilizer Advice</h3>
                    <p className="text-gray-500">No fertilizer recommendations found for this farm</p>
                  </div>
                ) : (
                  fertilizerAdvice.map((advice) => (
                    <div key={advice.id} className="bg-white rounded-lg shadow p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-sm text-gray-600">
                          {new Date(advice.date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </div>
                      </div>
                      <p className="mb-4 p-3 bg-green-50 rounded-lg">{advice.recommendation}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="p-3 bg-gray-50 rounded">
                          <p className="text-xs text-gray-600 mb-1">NPK Ratio</p>
                          <p className="text-sm">{advice.npkRatio}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded">
                          <p className="text-xs text-gray-600 mb-1">Quantity</p>
                          <p className="text-sm">{advice.quantity} kg/acre</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded">
                          <p className="text-xs text-gray-600 mb-1">Method</p>
                          <p className="text-sm">{advice.applicationMethod}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded">
                          <p className="text-xs text-gray-600 mb-1">Timing</p>
                          <p className="text-sm">{advice.timing}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl mb-2 text-gray-600">Select a Farm</h3>
            <p className="text-gray-500">Choose a farm from the dropdown above to view historical reports</p>
          </div>
        )}
      </main>
    </div>
  );
}
