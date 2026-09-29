import { useState, useEffect } from 'react';
import { 
  Save, 
  X, 
  Sprout,
  Loader,
  Cloud
} from 'lucide-react';
import { db } from '../services/firebaseConfig';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where,
  serverTimestamp 
} from 'firebase/firestore';

interface CropData {
  farmId: string;
  cropName: string;
  variety: string;
  plantedDate: string;
  expectedHarvestDate: string;
  growthStage: string;
  healthStatus: string;
  cultivationArea: string;
  notes: string;
}

interface Farm {
  id: string;
  name: string;
  location: string;
}

interface AddCropPageProps {
  userEmail: string;
  onCropAdded?: () => void;
}

const growthStages = ['Seedling', 'Vegetative', 'Flowering', 'Fruiting', 'Maturity', 'Harvest'];
const healthStatuses = ['Good', 'Fair', 'Poor', 'Critical'];

const cropOptions = [
  'Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane', 'Soybean',
  'Groundnut', 'Sunflower', 'Chickpea', 'Pigeon Pea', 'Millet',
  'Barley', 'Potato', 'Tomato', 'Onion', 'Grapes', 'Banana'
];

const varietyOptions: Record<string, string[]> = {
  'Rice': ['Basmati', 'IR-64', 'Swarna', 'Pusa-1121', 'MTU-1010'],
  'Wheat': ['HD-2967', 'PBW-343', 'DBW-187', 'WH-1105', 'GW-322'],
  'Maize': ['Pioneer-30B07', 'Syngenta-7832', 'DKC-9108', 'DHM-117'],
  'Cotton': ['BT-Cotton', 'Desi-Cotton', 'Hirsutum', 'Bharathi-1'],
  'Sugarcane': ['Co-0238', 'Co-86032', 'Co-98014', 'Co-99004'],
  'Soybean': ['JS-335', 'JS-9560', 'MAUS-47', 'PS-1042'],
  'Groundnut': ['TG-37A', 'ICGV-91114', 'K-6', 'G-20'],
  'Sunflower': ['KBSH-44', 'RSFH-130', 'DRSH-1', 'KBSH-53'],
  'Chickpea': ['BG-1103', 'JG-11', 'JAKI-9218', 'IPCA-98'],
  'Pigeon Pea': ['ICP-8863', 'ICPL-87119', 'Asha', 'Prabhat'],
  'Millet': ['Haryana-3', 'Raj-171', 'BJ-104', 'HC-10'],
  'Barley': ['RD-2552', 'BH-393', 'PL-891', 'DWRB-101'],
  'Potato': ['Kufri-Jyoti', 'Kufri-Pukhraj', 'Kufri-Ashoka', 'Kufri-Chipsona'],
  'Tomato': ['Arka-Vikas', 'Pusa-Ruby', 'Solan-Lal', 'HS-101'],
  'Onion': ['Pusa-Red', 'Nasik-Red', 'Agrifound-Dark-Red', 'Bhima-Kiran'],
  'Grapes': ['Thompson-Seedless', 'Bangalore-Blue', 'Anab-e-Shahi', 'Manjari'],
  'Banana': ['Grand-Naine', 'Robusta', 'Poovan', 'Nendran']
};

export function AddCropPage({ userEmail, onCropAdded }: AddCropPageProps) {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingFarms, setIsLoadingFarms] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [availableVarieties, setAvailableVarieties] = useState<string[]>([]);
  
  const [cropData, setCropData] = useState<CropData>({
    farmId: '',
    cropName: '',
    variety: '',
    plantedDate: '',
    expectedHarvestDate: '',
    growthStage: '',
    healthStatus: '',
    cultivationArea: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // ✅ Load farms from Firebase
  useEffect(() => {
    const loadFarms = async () => {
      try {
        setIsLoadingFarms(true);
        const q = query(
          collection(db, 'farms'),
          where('user_email', '==', userEmail)
        );
        const querySnapshot = await getDocs(q);
        
        const loadedFarms: Farm[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          loadedFarms.push({
            id: doc.id,
            name: data.name || 'Farm',
            location: data.location || 'Unknown'
          });
        });

        if (loadedFarms.length > 0) {
          setFarms(loadedFarms);
        } else {
          // Create a default farm in Firebase
          const defaultFarm = {
            name: 'Farm 1',
            location: 'Farm Location',
            user_email: userEmail,
            createdAt: serverTimestamp()
          };
          const docRef = await addDoc(collection(db, 'farms'), defaultFarm);
          setFarms([{
            id: docRef.id,
            name: 'Farm 1',
            location: 'Farm Location'
          }]);
        }
        console.log('✅ Farms loaded from Firebase');
      } catch (error) {
        console.error('Error loading farms:', error);
        // Fallback
        setFarms([{ id: 'farm-1', name: 'Farm 1', location: 'Farm Location' }]);
      } finally {
        setIsLoadingFarms(false);
      }
    };

    loadFarms();
  }, [userEmail]);

  // Update varieties when crop changes
  useEffect(() => {
    if (cropData.cropName) {
      setAvailableVarieties(varietyOptions[cropData.cropName] || []);
      setCropData(prev => ({ ...prev, variety: '' }));
    } else {
      setAvailableVarieties([]);
    }
  }, [cropData.cropName]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCropData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!cropData.farmId) newErrors.farmId = 'Please select a farm';
    if (!cropData.cropName) newErrors.cropName = 'Please select a crop';
    if (!cropData.variety) newErrors.variety = 'Please select a variety';
    if (!cropData.plantedDate) newErrors.plantedDate = 'Please select planted date';
    if (!cropData.expectedHarvestDate) newErrors.expectedHarvestDate = 'Please select expected harvest date';
    if (!cropData.growthStage) newErrors.growthStage = 'Please select growth stage';
    if (!cropData.healthStatus) newErrors.healthStatus = 'Please select health status';
    if (!cropData.cultivationArea) newErrors.cultivationArea = 'Please enter cultivation area';
    if (cropData.cultivationArea && isNaN(parseFloat(cropData.cultivationArea))) {
      newErrors.cultivationArea = 'Please enter a valid number';
    }

    if (cropData.plantedDate && cropData.expectedHarvestDate) {
      const planted = new Date(cropData.plantedDate);
      const harvest = new Date(cropData.expectedHarvestDate);
      if (harvest <= planted) {
        newErrors.expectedHarvestDate = 'Harvest date must be after planted date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Save crop to Firebase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    setIsSaving(true);
    setMessage(null);

    try {
      const newCrop = {
        ...cropData,
        user_email: userEmail,
        cultivationArea: parseFloat(cropData.cultivationArea),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Save to Firebase
      await addDoc(collection(db, 'crops'), newCrop);
      
      // Also save to localStorage as backup
      const savedCrops = localStorage.getItem(`bhoomi_crops_${userEmail}`);
      const crops = savedCrops ? JSON.parse(savedCrops) : [];
      crops.push({ ...newCrop, id: `local-${Date.now()}` });
      localStorage.setItem(`bhoomi_crops_${userEmail}`, JSON.stringify(crops));

      setMessage({ type: 'success', text: '✅ Crop added to Firebase successfully!' });
      
      // Reset form
      setCropData({
        farmId: '',
        cropName: '',
        variety: '',
        plantedDate: '',
        expectedHarvestDate: '',
        growthStage: '',
        healthStatus: '',
        cultivationArea: '',
        notes: ''
      });
      setAvailableVarieties([]);

      if (onCropAdded) {
        onCropAdded();
      }

      setTimeout(() => setMessage(null), 5000);
    } catch (error: any) {
      console.error('Error adding crop to Firebase:', error);
      setMessage({ 
        type: 'error', 
        text: `Failed to add crop: ${error.message || 'Please try again'}` 
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2 text-gray-800">
            <Sprout className="w-8 h-8 text-green-600" />
            Add New Crop
          </h1>
          <p className="text-gray-500 flex items-center gap-2">
            <Cloud className="w-4 h-4 text-green-600" />
            Data will be synced to Firebase Cloud
          </p>
        </div>

        {message && (
          <div className={`mb-4 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Farm Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Farm *
              </label>
              {isLoadingFarms ? (
                <div className="flex items-center gap-2 text-gray-500 p-2">
                  <Loader className="w-4 h-4 animate-spin" />
                  Loading farms from Firebase...
                </div>
              ) : (
                <select
                  name="farmId"
                  value={cropData.farmId}
                  onChange={handleChange}
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
              )}
              {errors.farmId && (
                <p className="text-red-500 text-sm mt-1">{errors.farmId}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Crop Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Crop Name *
                </label>
                <select
                  name="cropName"
                  value={cropData.cropName}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.cropName ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select crop</option>
                  {cropOptions.map((crop) => (
                    <option key={crop} value={crop}>{crop}</option>
                  ))}
                </select>
                {errors.cropName && (
                  <p className="text-red-500 text-sm mt-1">{errors.cropName}</p>
                )}
              </div>

              {/* Variety */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Variety *
                </label>
                <select
                  name="variety"
                  value={cropData.variety}
                  onChange={handleChange}
                  disabled={!cropData.cropName}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.variety ? 'border-red-500' : 'border-gray-300'
                  } ${!cropData.cropName ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                >
                  <option value="">Select variety</option>
                  {availableVarieties.map((variety) => (
                    <option key={variety} value={variety}>{variety}</option>
                  ))}
                </select>
                {errors.variety && (
                  <p className="text-red-500 text-sm mt-1">{errors.variety}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Planted Date *
                </label>
                <input
                  type="date"
                  name="plantedDate"
                  value={cropData.plantedDate}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.plantedDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.plantedDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.plantedDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Harvest Date *
                </label>
                <input
                  type="date"
                  name="expectedHarvestDate"
                  value={cropData.expectedHarvestDate}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.expectedHarvestDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.expectedHarvestDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.expectedHarvestDate}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Growth Stage *
                </label>
                <select
                  name="growthStage"
                  value={cropData.growthStage}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.growthStage ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select growth stage</option>
                  {growthStages.map((stage) => (
                    <option key={stage} value={stage}>{stage}</option>
                  ))}
                </select>
                {errors.growthStage && (
                  <p className="text-red-500 text-sm mt-1">{errors.growthStage}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Health Status *
                </label>
                <select
                  name="healthStatus"
                  value={cropData.healthStatus}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.healthStatus ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select health status</option>
                  {healthStatuses.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                {errors.healthStatus && (
                  <p className="text-red-500 text-sm mt-1">{errors.healthStatus}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cultivation Area (Acres) *
              </label>
              <input
                type="text"
                name="cultivationArea"
                value={cropData.cultivationArea}
                onChange={handleChange}
                placeholder="Enter area in acres"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.cultivationArea ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.cultivationArea && (
                <p className="text-red-500 text-sm mt-1">{errors.cultivationArea}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={cropData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Add any additional information about this crop..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={isSaving || isLoadingFarms}
              className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Saving to Firebase...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Add Crop
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}