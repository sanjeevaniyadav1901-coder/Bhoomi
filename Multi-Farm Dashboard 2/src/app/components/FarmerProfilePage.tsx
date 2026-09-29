import { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Save, 
  Edit, 
  X, 
  Camera,
  Leaf,
  Calendar,
  Loader
} from 'lucide-react';
import { db } from '../services/firebaseConfig';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

interface FarmerProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  village: string;
  district: string;
  state: string;
  pincode: string;
  farmSize: string;
  primaryCrop: string;
  farmingExperience: string;
  profileImage?: string;
  memberSince: string;
  updatedAt?: string;
}

interface FarmerProfilePageProps {
  userEmail: string;
  userName?: string;
}

export function FarmerProfilePage({ userEmail, userName }: FarmerProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [profile, setProfile] = useState<FarmerProfile>({
    firstName: userName || '',
    lastName: '',
    email: userEmail || '',
    phone: '',
    address: '',
    village: '',
    district: '',
    state: '',
    pincode: '',
    farmSize: '',
    primaryCrop: '',
    farmingExperience: '',
    memberSince: new Date().toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  });

  const [savedProfile, setSavedProfile] = useState<FarmerProfile | null>(null);

  // ✅ Load profile from Firebase on mount
  useEffect(() => {
    const loadProfile = async () => {
      if (!userEmail) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const docRef = doc(db, 'farmer_profiles', userEmail);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as FarmerProfile;
          setProfile(data);
          setSavedProfile(data);
          console.log('✅ Profile loaded from Firebase');
        } else {
          // First time user - create initial profile in Firebase
          const initialProfile = {
            firstName: userName || userEmail.split('@')[0],
            lastName: '',
            email: userEmail,
            phone: '',
            address: '',
            village: '',
            district: '',
            state: '',
            pincode: '',
            farmSize: '',
            primaryCrop: '',
            farmingExperience: '',
            memberSince: new Date().toLocaleDateString('en-IN', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }),
            updatedAt: new Date().toISOString()
          };
          
          await setDoc(docRef, initialProfile);
          setProfile(initialProfile);
          setSavedProfile(initialProfile);
          console.log('✅ Initial profile created in Firebase');
        }
      } catch (error) {
        console.error('Error loading profile from Firebase:', error);
        // Fallback to localStorage
        const saved = localStorage.getItem(`bhoomi_profile_${userEmail}`);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setProfile(parsed);
            setSavedProfile(parsed);
          } catch (e) {
            console.error('Error parsing local profile:', e);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [userEmail, userName]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  // ✅ Save profile to Firebase
  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    
    try {
      const profileData = {
        ...profile,
        email: userEmail,
        updatedAt: new Date().toISOString()
      };

      // Save to Firebase
      const docRef = doc(db, 'farmer_profiles', userEmail);
      await setDoc(docRef, profileData, { merge: true });

      // Also save to localStorage as backup
      localStorage.setItem(`bhoomi_profile_${userEmail}`, JSON.stringify(profileData));

      setSavedProfile(profileData);
      setIsEditing(false);
      setMessage({ type: 'success', text: '✅ Profile saved to Firebase successfully!' });
      
      // Update user name in session
      const currentUser = localStorage.getItem('bhoomi_current_user');
      if (currentUser) {
        const user = JSON.parse(currentUser);
        user.name = `${profile.firstName} ${profile.lastName}`.trim() || user.name;
        localStorage.setItem('bhoomi_current_user', JSON.stringify(user));
      }
    } catch (error: any) {
      console.error('Error saving profile to Firebase:', error);
      setMessage({ 
        type: 'error', 
        text: `Failed to save profile: ${error.message || 'Please try again'}` 
      });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleCancel = () => {
    if (savedProfile) {
      setProfile({ ...savedProfile });
    }
    setIsEditing(false);
  };

  const getInitials = () => {
    const first = profile.firstName?.charAt(0) || '';
    const last = profile.lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || 'F';
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2 text-gray-800">
            <User className="w-8 h-8 text-green-600" />
            Farmer Profile
          </h1>
          <p className="text-gray-500">Manage your personal and farm information (synced to cloud)</p>
        </div>

        {message && (
          <div className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Cover/Header Section */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold text-white border-4 border-white/50">
                  {getInitials()}
                </div>
              </div>
              
              {/* Basic Info */}
              <div className="text-center md:text-left flex-1">
                <h2 className="text-2xl font-bold">
                  {`${profile.firstName} ${profile.lastName}`.trim() || 'Farmer'}
                </h2>
                <p className="text-green-100 flex items-center justify-center md:justify-start gap-2">
                  <Mail className="w-4 h-4" />
                  {profile.email}
                </p>
                <p className="text-green-100 text-sm mt-1">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Member since {profile.memberSince}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-white text-green-700 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      {isSaving ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 flex items-center gap-2">
                  <User className="w-5 h-5 text-green-600" />
                  Personal Information
                </h3>

                {isEditing ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={profile.firstName}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={profile.lastName}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={profile.phone}
                        onChange={handleChange}
                        placeholder="Enter phone number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 w-24">Full Name:</span>
                      <span className="font-medium">{`${profile.firstName} ${profile.lastName}`.trim() || 'Not set'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 w-24">Phone:</span>
                      <span className="font-medium">{profile.phone || 'Not set'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 w-24">Email:</span>
                      <span className="font-medium">{profile.email}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Address Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  Address
                </h3>

                {isEditing ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Village</label>
                      <input
                        type="text"
                        name="village"
                        value={profile.village}
                        onChange={handleChange}
                        placeholder="Enter village name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">District</label>
                      <input
                        type="text"
                        name="district"
                        value={profile.district}
                        onChange={handleChange}
                        placeholder="Enter district"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">State</label>
                      <input
                        type="text"
                        name="state"
                        value={profile.state}
                        onChange={handleChange}
                        placeholder="Enter state"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Pincode</label>
                      <input
                        type="text"
                        name="pincode"
                        value={profile.pincode}
                        onChange={handleChange}
                        placeholder="Enter pincode"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 w-24">Village:</span>
                      <span className="font-medium">{profile.village || 'Not set'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 w-24">District:</span>
                      <span className="font-medium">{profile.district || 'Not set'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 w-24">State:</span>
                      <span className="font-medium">{profile.state || 'Not set'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 w-24">Pincode:</span>
                      <span className="font-medium">{profile.pincode || 'Not set'}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Farm Information */}
              <div className="space-y-4 md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-green-600" />
                  Farm Information
                </h3>

                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Farm Size (Acres)</label>
                      <input
                        type="text"
                        name="farmSize"
                        value={profile.farmSize}
                        onChange={handleChange}
                        placeholder="e.g. 5"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Primary Crop</label>
                      <input
                        type="text"
                        name="primaryCrop"
                        value={profile.primaryCrop}
                        onChange={handleChange}
                        placeholder="e.g. Wheat"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Experience (Years)</label>
                      <input
                        type="text"
                        name="farmingExperience"
                        value={profile.farmingExperience}
                        onChange={handleChange}
                        placeholder="e.g. 10"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Farm Size:</span>
                      <span className="font-medium">{profile.farmSize ? `${profile.farmSize} Acres` : 'Not set'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Primary Crop:</span>
                      <span className="font-medium">{profile.primaryCrop || 'Not set'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Experience:</span>
                      <span className="font-medium">{profile.farmingExperience ? `${profile.farmingExperience} Years` : 'Not set'}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Cloud Sync Indicator */}
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Profile synced with Firebase Cloud</span>
        </div>
      </div>
    </div>
  );
}