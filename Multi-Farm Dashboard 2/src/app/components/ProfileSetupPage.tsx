import { useState } from 'react';
import { User, MapPin, Phone, Layers, ArrowRight } from 'lucide-react';
import { FarmerProfile } from '../types';
import { saveFarmerProfile } from '../services/storageService';

interface ProfileSetupPageProps {
  userEmail: string;
  userName: string;
  onProfileComplete: () => void;
}

export function ProfileSetupPage({ userEmail, userName, onProfileComplete }: ProfileSetupPageProps) {
  const [formData, setFormData] = useState({
    village: '',
    contactNumber: '',
    landSize: '',
    soilType: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.village.trim()) {
      newErrors.village = 'Village/Location is required';
    }

    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required';
    } else if (!/^[0-9]{10}$/.test(formData.contactNumber.replace(/\s/g, ''))) {
      newErrors.contactNumber = 'Please enter a valid 10-digit contact number';
    }

    if (!formData.landSize || parseFloat(formData.landSize) <= 0) {
      newErrors.landSize = 'Please enter a valid land size';
    }

    if (!formData.soilType) {
      newErrors.soilType = 'Please select a soil type';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    // ✅ SAFE name split
    const nameParts = (userName || '').split(' ');

    const profile: FarmerProfile = {
      email: userEmail,
      firstName: nameParts[0] || '',
      surname: nameParts.slice(1).join(' ') || '',
      village: formData.village,
      contactNumber: formData.contactNumber,
      // ✅ SAFE number conversion
      landSize: parseFloat(formData.landSize) || 0,
      soilType: formData.soilType,
      createdAt: new Date().toISOString(),
    };

    try {
      // ✅ SAVE SAFELY
      saveFarmerProfile(profile);

      // ✅ MOVE TO DASHBOARD (CORRECT FLOW)
      onProfileComplete();
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Something went wrong while saving profile.");
    }
  };

  const soilTypes = [
    'Black Soil',
    'Red Soil',
    'Alluvial Soil',
    'Laterite Soil',
    'Clay Soil',
    'Sandy Soil',
    'Loamy Soil',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-600 rounded-full mb-4">
            <User className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl mb-2">Welcome to Bhoomi!</h1>
          <p className="text-gray-600">
            Let's set up your farmer profile to get started
          </p>
        </div>

        <div className="mb-8 p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Name:</strong> {userName}
          </p>
          <p className="text-sm text-gray-700 mt-1">
            <strong>Email:</strong> {userEmail}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          <div>
            <label className="flex items-center gap-2 text-sm mb-2 text-gray-700">
              <MapPin className="w-4 h-4" />
              Village / Location *
            </label>
            <input
              type="text"
              value={formData.village}
              onChange={(e) => setFormData({ ...formData, village: e.target.value })}
              placeholder="Enter your village or location"
              className={`w-full px-4 py-3 border rounded-lg ${
                errors.village ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.village && <p className="text-red-500 text-sm mt-1">{errors.village}</p>}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm mb-2 text-gray-700">
              <Phone className="w-4 h-4" />
              Contact Number *
            </label>
            <input
              type="tel"
              value={formData.contactNumber}
              onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
              placeholder="Enter your 10-digit contact number"
              className={`w-full px-4 py-3 border rounded-lg ${
                errors.contactNumber ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.contactNumber && <p className="text-red-500 text-sm mt-1">{errors.contactNumber}</p>}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm mb-2 text-gray-700">
              <Layers className="w-4 h-4" />
              Total Land Size (Acres) *
            </label>
            <input
              type="number"
              value={formData.landSize}
              onChange={(e) => setFormData({ ...formData, landSize: e.target.value })}
              placeholder="Enter total land size in acres"
              min="0"
              step="0.1"
              className={`w-full px-4 py-3 border rounded-lg ${
                errors.landSize ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.landSize && <p className="text-red-500 text-sm mt-1">{errors.landSize}</p>}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm mb-2 text-gray-700">
              <Layers className="w-4 h-4" />
              Primary Soil Type *
            </label>
            <select
              value={formData.soilType}
              onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
              className={`w-full px-4 py-3 border rounded-lg ${
                errors.soilType ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select soil type</option>
              {soilTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.soilType && <p className="text-red-500 text-sm mt-1">{errors.soilType}</p>}
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-green-600 text-white rounded-lg"
          >
            <span>Complete Profile Setup</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-6">
          * All fields are required to continue
        </p>
      </div>
    </div>
  );
}