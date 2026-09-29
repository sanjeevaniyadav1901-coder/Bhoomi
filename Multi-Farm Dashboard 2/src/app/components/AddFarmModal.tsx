import { useState } from 'react';
import { X, MapPin, Ruler, Plus } from 'lucide-react';
import { Farm } from '../types';

interface AddFarmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFarm: (farm: Farm) => void;
  existingFarmCount: number;
}

export function AddFarmModal({ isOpen, onClose, onAddFarm, existingFarmCount }: AddFarmModalProps) {
  const [formData, setFormData] = useState({
    name: `Farm ${existingFarmCount + 1}`,
    location: '',
    area: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Farm name is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!formData.area || parseFloat(formData.area) <= 0) {
      newErrors.area = 'Valid area is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      const newFarm: Farm = {
        id: String(Date.now()),
        name: formData.name,
        location: formData.location,
        area: parseFloat(formData.area),
      };

      onAddFarm(newFarm);
      
      // Reset form
      setFormData({
        name: `Farm ${existingFarmCount + 2}`,
        location: '',
        area: '',
      });
      setErrors({});
      onClose();
    }
  };

  const handleClose = () => {
    setFormData({
      name: `Farm ${existingFarmCount + 1}`,
      location: '',
      area: '',
    });
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Plus className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-2xl">Add New Farm</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Farm Name */}
          <div>
            <label className="block text-sm mb-2 text-gray-700">
              Farm Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Farm 5"
              className={`w-full px-4 py-3 border ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500`}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm mb-2 text-gray-700">
              Location <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Pune, Maharashtra"
                className={`w-full pl-10 pr-4 py-3 border ${
                  errors.location ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500`}
              />
            </div>
            {errors.location && (
              <p className="text-red-500 text-sm mt-1">{errors.location}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Enter city/district in Maharashtra
            </p>
          </div>

          {/* Area */}
          <div>
            <label className="block text-sm mb-2 text-gray-700">
              Area (in acres) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                placeholder="e.g., 10.5"
                className={`w-full pl-10 pr-4 py-3 border ${
                  errors.area ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500`}
              />
            </div>
            {errors.area && (
              <p className="text-red-500 text-sm mt-1">{errors.area}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Enter farm area in acres (1 hectare = 2.47 acres)
            </p>
          </div>

          {/* Info Box */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm mb-2 text-blue-900">What happens next?</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Farm will be added to your dashboard</li>
              <li>• Sensors can be configured for this farm</li>
              <li>• Irrigation system can be set up</li>
              <li>• AI/ML recommendations will be generated</li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Add Farm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
