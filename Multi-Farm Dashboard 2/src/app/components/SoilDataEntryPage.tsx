import { useState, useEffect } from 'react';
import { BarChart3, Plus, Save, X, History, TrendingUp, Calendar, Download, Eye, EyeOff } from 'lucide-react';
import { SoilRecord, Farm } from '../types';
import { addSoilRecord, getFarmSoilRecords, getUserFarms } from '../services/storageService';

interface SoilDataEntryPageProps {
  userEmail: string;
  selectedFarmId: string | null;
  onSoilDataUpdate?: () => void;
  defaultView?: 'form' | 'history'; // Add this prop
}

export function SoilDataEntryPage({ 
  userEmail, 
  selectedFarmId, 
  onSoilDataUpdate,
  defaultView = 'form' // Default to form
}: SoilDataEntryPageProps) {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(defaultView === 'form');
  const [soilRecords, setSoilRecords] = useState<SoilRecord[]>([]);
  const [showHistory, setShowHistory] = useState(defaultView === 'history');
  const [formData, setFormData] = useState({
    farmId: selectedFarmId || '',
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    ec: '',
    humidity: '',
    ph: '',
    moisture: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load farms and records
  useEffect(() => {
    setFarms(getUserFarms(userEmail));
    if (selectedFarmId) {
      loadSoilRecords(selectedFarmId);
    }
  }, [userEmail, selectedFarmId]);

  // Update form when selected farm changes
  useEffect(() => {
    if (selectedFarmId) {
      setFormData((prev) => ({ ...prev, farmId: selectedFarmId }));
      loadSoilRecords(selectedFarmId);
    }
  }, [selectedFarmId]);

  // Set default view based on prop
  useEffect(() => {
    if (defaultView === 'history') {
      setShowHistory(true);
      setIsFormOpen(false);
    } else {
      setShowHistory(false);
      setIsFormOpen(true);
    }
  }, [defaultView]);

  const loadSoilRecords = (farmId: string) => {
    const records = getFarmSoilRecords(userEmail, farmId);
    setSoilRecords(records);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.farmId) {
      newErrors.farmId = 'Please select a farm';
    }

    const numericFields = {
      nitrogen: 'Nitrogen',
      phosphorus: 'Phosphorus',
      potassium: 'Potassium',
      ec: 'EC',
      humidity: 'Humidity',
      ph: 'pH',
      moisture: 'Moisture',
    };

    Object.entries(numericFields).forEach(([key, label]) => {
      const value = formData[key as keyof typeof formData];
      if (!value || isNaN(parseFloat(value))) {
        newErrors[key] = `${label} must be a valid number`;
      }
    });

    if (formData.ph && (parseFloat(formData.ph) < 0 || parseFloat(formData.ph) > 14)) {
      newErrors.ph = 'pH must be between 0 and 14';
    }

    if (formData.humidity && (parseFloat(formData.humidity) < 0 || parseFloat(formData.humidity) > 100)) {
      newErrors.humidity = 'Humidity must be between 0 and 100';
    }

    if (formData.moisture && (parseFloat(formData.moisture) < 0 || parseFloat(formData.moisture) > 100)) {
      newErrors.moisture = 'Moisture must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const record: SoilRecord = {
      id: Date.now().toString(),
      farmId: formData.farmId,
      recordDate: new Date().toISOString(),
      nitrogen: parseFloat(formData.nitrogen),
      phosphorus: parseFloat(formData.phosphorus),
      potassium: parseFloat(formData.potassium),
      ec: parseFloat(formData.ec),
      humidity: parseFloat(formData.humidity),
      ph: parseFloat(formData.ph),
      moisture: parseFloat(formData.moisture),
      notes: formData.notes,
    };

    addSoilRecord(userEmail, record);
    
    // Refresh records
    loadSoilRecords(formData.farmId);
    
    // Notify parent component
    if (onSoilDataUpdate) {
      onSoilDataUpdate();
    }

    // Reset form
    setFormData({
      farmId: selectedFarmId || '',
      nitrogen: '',
      phosphorus: '',
      potassium: '',
      ec: '',
      humidity: '',
      ph: '',
      moisture: '',
      notes: '',
    });
    setIsFormOpen(false);
    setShowHistory(true);
  };

  const handleCancel = () => {
    setFormData({
      farmId: selectedFarmId || '',
      nitrogen: '',
      phosphorus: '',
      potassium: '',
      ec: '',
      humidity: '',
      ph: '',
      moisture: '',
      notes: '',
    });
    setErrors({});
    setIsFormOpen(false);
    setShowHistory(true);
  };

  const getParameterStatus = (value: number, type: string) => {
    const ranges: Record<string, { min: number; max: number; label: string }> = {
      nitrogen: { min: 80, max: 120, label: 'kg/ha' },
      phosphorus: { min: 40, max: 60, label: 'kg/ha' },
      potassium: { min: 110, max: 150, label: 'kg/ha' },
      ec: { min: 0.5, max: 2.0, label: 'dS/m' },
      humidity: { min: 40, max: 80, label: '%' },
      ph: { min: 6.0, max: 7.5, label: '' },
      moisture: { min: 25, max: 60, label: '%' },
    };

    const range = ranges[type];
    if (!range) return { status: 'normal', color: 'text-green-600', bg: 'bg-green-100' };

    if (value < range.min) {
      return { status: 'low', color: 'text-orange-600', bg: 'bg-orange-100' };
    } else if (value > range.max) {
      return { status: 'high', color: 'text-red-600', bg: 'bg-red-100' };
    } else {
      return { status: 'normal', color: 'text-green-600', bg: 'bg-green-100' };
    }
  };

  const toggleView = () => {
    if (showHistory) {
      setShowHistory(false);
      setIsFormOpen(true);
    } else {
      setShowHistory(true);
      setIsFormOpen(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header with toggle */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-600 rounded-lg">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Soil Data</h3>
            <p className="text-sm text-gray-500">
              {showHistory 
                ? `${soilRecords.length} records found` 
                : 'Add new soil readings'}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={toggleView}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm ${
              showHistory 
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {showHistory ? (
              <>
                <EyeOff className="w-4 h-4" />
                Hide History
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                View History
              </>
            )}
          </button>

          {showHistory && (
            <button
              onClick={() => {
                setShowHistory(false);
                setIsFormOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Record
            </button>
          )}

          {showHistory && soilRecords.length > 0 && (
            <button
              onClick={() => {
                const headers = ['Date', 'N (kg/ha)', 'P (kg/ha)', 'K (kg/ha)', 'EC', 'pH', 'Humidity', 'Moisture', 'Notes'];
                const csvData = soilRecords.map(r => [
                  new Date(r.recordDate).toLocaleDateString(),
                  r.nitrogen, r.phosphorus, r.potassium, r.ec, r.ph, r.humidity, r.moisture, r.notes || ''
                ]);
                const csv = [headers.join(','), ...csvData.map(row => row.join(','))].join('\n');
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `soil_data_${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
                window.URL.revokeObjectURL(url);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          )}
        </div>
      </div>

      {/* History View */}
      {showHistory && (
        <div>
          {soilRecords.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No soil records found for this farm</p>
              <button
                onClick={() => {
                  setShowHistory(false);
                  setIsFormOpen(true);
                }}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
              >
                Add First Record
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-gray-600">Date</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-600">N</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-600">P</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-600">K</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-600">EC</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-600">pH</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-600">Humidity</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-600">Moisture</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {soilRecords.map((record) => {
                    const avgStatus = getParameterStatus(record.moisture, 'moisture');
                    return (
                      <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-2 whitespace-nowrap">
                          {new Date(record.recordDate).toLocaleDateString()}
                        </td>
                        <td className="px-3 py-2">{record.nitrogen}</td>
                        <td className="px-3 py-2">{record.phosphorus}</td>
                        <td className="px-3 py-2">{record.potassium}</td>
                        <td className="px-3 py-2">{record.ec}</td>
                        <td className="px-3 py-2">{record.ph}</td>
                        <td className="px-3 py-2">{record.humidity}</td>
                        <td className="px-3 py-2">{record.moisture}</td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${avgStatus.bg} ${avgStatus.color}`}>
                            {avgStatus.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Form View */}
      {!showHistory && isFormOpen && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Farm Selection */}
          <div>
            <label className="text-sm mb-2 block text-gray-700 font-medium">
              Select Farm *
            </label>
            <select
              value={formData.farmId}
              onChange={(e) => setFormData({ ...formData, farmId: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errors.farmId ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Choose a farm</option>
              {farms.map((farm) => (
                <option key={farm.id} value={farm.id}>
                  {farm.name} - {farm.location}
                </option>
              ))}
            </select>
            {errors.farmId && (
              <p className="text-red-500 text-sm mt-1">{errors.farmId}</p>
            )}
          </div>

          {/* NPK Values */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm mb-2 block text-gray-700 font-medium">
                Nitrogen (N) mg/kg *
              </label>
              <input
                type="range"
                min="0"
                max="200"
                step="0.5"
                value={formData.nitrogen || 0}
                onChange={(e) => setFormData({ ...formData, nitrogen: e.target.value })}
                className="w-full accent-green-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0</span>
                <span className="font-semibold">{formData.nitrogen || 0} mg/kg</span>
                <span>200</span>
              </div>
              <input
                type="number"
                step="0.1"
                value={formData.nitrogen}
                onChange={(e) => setFormData({ ...formData, nitrogen: e.target.value })}
                className={`w-full mt-2 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.nitrogen ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.nitrogen && (
                <p className="text-red-500 text-sm mt-1">{errors.nitrogen}</p>
              )}
            </div>

            <div>
              <label className="text-sm mb-2 block text-gray-700 font-medium">
                Phosphorus (P) mg/kg *
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="0.5"
                value={formData.phosphorus || 0}
                onChange={(e) => setFormData({ ...formData, phosphorus: e.target.value })}
                className="w-full accent-green-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0</span>
                <span className="font-semibold">{formData.phosphorus || 0} mg/kg</span>
                <span>100</span>
              </div>
              <input
                type="number"
                step="0.1"
                value={formData.phosphorus}
                onChange={(e) => setFormData({ ...formData, phosphorus: e.target.value })}
                className={`w-full mt-2 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.phosphorus ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.phosphorus && (
                <p className="text-red-500 text-sm mt-1">{errors.phosphorus}</p>
              )}
            </div>

            <div>
              <label className="text-sm mb-2 block text-gray-700 font-medium">
                Potassium (K) mg/kg *
              </label>
              <input
                type="range"
                min="0"
                max="200"
                step="0.5"
                value={formData.potassium || 0}
                onChange={(e) => setFormData({ ...formData, potassium: e.target.value })}
                className="w-full accent-green-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0</span>
                <span className="font-semibold">{formData.potassium || 0} mg/kg</span>
                <span>200</span>
              </div>
              <input
                type="number"
                step="0.1"
                value={formData.potassium}
                onChange={(e) => setFormData({ ...formData, potassium: e.target.value })}
                className={`w-full mt-2 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.potassium ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.potassium && (
                <p className="text-red-500 text-sm mt-1">{errors.potassium}</p>
              )}
            </div>
          </div>

          {/* Other Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm mb-2 block text-gray-700 font-medium">
                EC (dS/m) *
              </label>
              <input
                type="range"
                min="0"
                max="5"
                step="0.01"
                value={formData.ec || 0}
                onChange={(e) => setFormData({ ...formData, ec: e.target.value })}
                className="w-full accent-green-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0</span>
                <span className="font-semibold">{formData.ec || 0} dS/m</span>
                <span>5</span>
              </div>
              <input
                type="number"
                step="0.01"
                value={formData.ec}
                onChange={(e) => setFormData({ ...formData, ec: e.target.value })}
                className={`w-full mt-2 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.ec ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.ec && (
                <p className="text-red-500 text-sm mt-1">{errors.ec}</p>
              )}
            </div>

            <div>
              <label className="text-sm mb-2 block text-gray-700 font-medium">
                pH Level *
              </label>
              <input
                type="range"
                min="0"
                max="14"
                step="0.1"
                value={formData.ph || 7}
                onChange={(e) => setFormData({ ...formData, ph: e.target.value })}
                className="w-full accent-green-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0</span>
                <span className="font-semibold">{formData.ph || 7}</span>
                <span>14</span>
              </div>
              <input
                type="number"
                step="0.1"
                min="0"
                max="14"
                value={formData.ph}
                onChange={(e) => setFormData({ ...formData, ph: e.target.value })}
                className={`w-full mt-2 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.ph ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.ph && (
                <p className="text-red-500 text-sm mt-1">{errors.ph}</p>
              )}
            </div>

            <div>
              <label className="text-sm mb-2 block text-gray-700 font-medium">
                Humidity (%) *
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="0.5"
                value={formData.humidity || 0}
                onChange={(e) => setFormData({ ...formData, humidity: e.target.value })}
                className="w-full accent-green-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0</span>
                <span className="font-semibold">{formData.humidity || 0}%</span>
                <span>100</span>
              </div>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.humidity}
                onChange={(e) => setFormData({ ...formData, humidity: e.target.value })}
                className={`w-full mt-2 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.humidity ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.humidity && (
                <p className="text-red-500 text-sm mt-1">{errors.humidity}</p>
              )}
            </div>

            <div>
              <label className="text-sm mb-2 block text-gray-700 font-medium">
                Soil Moisture (%) *
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="0.5"
                value={formData.moisture || 0}
                onChange={(e) => setFormData({ ...formData, moisture: e.target.value })}
                className="w-full accent-green-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0</span>
                <span className="font-semibold">{formData.moisture || 0}%</span>
                <span>100</span>
              </div>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.moisture}
                onChange={(e) => setFormData({ ...formData, moisture: e.target.value })}
                className={`w-full mt-2 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.moisture ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.moisture && (
                <p className="text-red-500 text-sm mt-1">{errors.moisture}</p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm mb-2 block text-gray-700 font-medium">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Add any observations or notes about this soil reading..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Save className="w-5 h-5" />
              Save Soil Record
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}