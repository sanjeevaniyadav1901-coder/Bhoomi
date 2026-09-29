// api.ts - Complete version

// ============================================
// WEATHER API
// ============================================

export async function getWeather(city: string) {
  try {
    const res = await fetch(`http://127.0.0.1:5000/weather/${city}`);

    if (!res.ok) {
      throw new Error("Failed to fetch weather");
    }

    const data = await res.json();

    return {
      temperature: data?.main?.temp ?? 0,
      humidity: data?.main?.humidity ?? 0,
      windSpeed: data?.wind?.speed ?? 0,
      rainfall: data?.rain?.["1h"] ?? 0,
      rainProbability: data?.clouds?.all ?? 0,
      condition: data?.weather?.[0]?.description ?? "N/A",
    };
  } catch (error) {
    console.error(error);
    return {
      temperature: 0,
      humidity: 0,
      windSpeed: 0,
      rainfall: 0,
      rainProbability: 0,
      condition: "Error",
    };
  }
}

// ============================================
// CROP HEALTH API
// ============================================

export const cropHealthApi = {
  analyze: async (imageFile: File, fieldId: string) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('field_id', fieldId);

    try {
      const response = await fetch('http://127.0.0.1:5000/api/crop-health/analyze', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to analyze crop health');
      }

      return await response.json();
    } catch (error) {
      console.error('Crop health analysis error:', error);
      throw error;
    }
  },

  getHistory: async (fieldId: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/crop-health/history/${fieldId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch crop health history');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching crop health history:', error);
      throw error;
    }
  }
};

// ============================================
// PEST DETECTION API
// ============================================

export const pestApi = {
  detect: async (imageFile: File, fieldId: string) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('field_id', fieldId);

    try {
      const response = await fetch('http://127.0.0.1:5000/api/pests/detect', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to detect pests');
      }

      return await response.json();
    } catch (error) {
      console.error('Pest detection error:', error);
      throw error;
    }
  },

  getAlerts: async (fieldId: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/pests/alerts/${fieldId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch pest alerts');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching pest alerts:', error);
      throw error;
    }
  }
};

// ============================================
// IRRIGATION API
// ============================================

export const irrigationApi = {
  getRecommendation: async (fieldId: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/irrigation/recommend/${fieldId}`);

      if (!response.ok) {
        throw new Error('Failed to get irrigation recommendation');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching irrigation recommendation:', error);
      throw error;
    }
  },

  getHistory: async (fieldId: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/irrigation/history/${fieldId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch irrigation history');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching irrigation history:', error);
      throw error;
    }
  }
};

// ============================================
// ENVIRONMENTAL RISK API
// ============================================

export const environmentalRiskApi = {
  getRisks: async (fieldId: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/environmental-risks/${fieldId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch environmental risks');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching environmental risks:', error);
      throw error;
    }
  }
};

// ============================================
// FARMER ADVISORY API
// ============================================

export const advisoryApi = {
  generate: async (fieldId: string) => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/advisory/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ field_id: fieldId })
      });

      if (!response.ok) {
        throw new Error('Failed to generate advisory');
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating advisory:', error);
      throw error;
    }
  },

  getAdvisories: async (fieldId: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/advisory/${fieldId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch advisories');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching advisories:', error);
      throw error;
    }
  },

  markAsRead: async (advisoryId: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/advisory/read/${advisoryId}`, {
        method: 'PUT'
      });

      if (!response.ok) {
        throw new Error('Failed to mark advisory as read');
      }

      return await response.json();
    } catch (error) {
      console.error('Error marking advisory as read:', error);
      throw error;
    }
  }
};

// ============================================
// FARM MANAGEMENT API
// ============================================

export const farmApi = {
  register: async (farmData: {
    farm_id: string;
    farm_name: string;
    location: string;
    farmer_name: string;
    user_id: string;
  }) => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/farm/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(farmData)
      });

      if (!response.ok) {
        throw new Error('Failed to register farm');
      }

      return await response.json();
    } catch (error) {
      console.error('Error registering farm:', error);
      throw error;
    }
  },

  getUserFarms: async (userId: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/farms/user/${userId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch farms');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching farms:', error);
      throw error;
    }
  },

  updateSoil: async (soilData: {
    farm_id: string;
    ph: number;
    ec: number;
    organic_carbon: number;
    nitrogen: number;
    phosphorus: number;
    potassium: number;
  }) => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/soil/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(soilData)
      });

      if (!response.ok) {
        throw new Error('Failed to update soil data');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating soil data:', error);
      throw error;
    }
  }
};

// ============================================
// EDGE AI API
// ============================================

export const edgeAIApi = {
  process: async (imageData: string, modelType: string, fieldId: string) => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/edge/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_data: imageData,
          model_type: modelType,
          field_id: fieldId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to process on edge');
      }

      return await response.json();
    } catch (error) {
      console.error('Edge processing error:', error);
      throw error;
    }
  }
};

// ============================================
// ANALYTICS API
// ============================================

export const analyticsApi = {
  getDashboardData: async (fieldId: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/analytics/${fieldId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  }
};

// ============================================
// AUTHENTICATION (Firebase)
// ============================================

export const loginUser = async (email: string, password: string) => {
  try {
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    const { auth } = await import('../services/firebaseConfig');

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const idToken = await user.getIdToken();

    localStorage.setItem('firebase_token', idToken);

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName
      }
    };
  } catch (error: any) {
    console.error("Login error:", error);
    return {
      success: false,
      message: error.message || "Login failed"
    };
  }
};

export const registerUser = async (email: string, password: string, displayName: string) => {
  try {
    const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
    const { auth } = await import('../services/firebaseConfig');

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, { displayName });

    const idToken = await user.getIdToken();
    localStorage.setItem('firebase_token', idToken);

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: displayName
      }
    };
  } catch (error: any) {
    console.error("Registration error:", error);
    return {
      success: false,
      message: error.message || "Registration failed"
    };
  }
};

// ============================================
// AUTH HELPER
// ============================================

export const getAuthHeaders = () => {
  const token = localStorage.getItem('firebase_token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};