// Local Storage Service for Bhoomi
// Handles user data and farm data storage without Firebase

import { Farm, FarmData, FarmerProfile, Crop, SoilRecord, FertilizerAdvice, WeatherAlert } from '../types';

const STORAGE_KEYS = {
  USERS: 'bhoomi_users',
  CURRENT_USER: 'bhoomi_current_user',
  FARMS: 'bhoomi_farms',
  FARM_DATA: 'bhoomi_farm_data',
  FARMER_PROFILES: 'bhoomi_farmer_profiles',
  CROPS: 'bhoomi_crops',
  SOIL_RECORDS: 'bhoomi_soil_records',
  FERTILIZER_ADVICE: 'bhoomi_fertilizer_advice',
  WEATHER_ALERTS: 'bhoomi_weather_alerts',
};

export interface StoredUser {
  firstName: string;
  surname: string;
  email: string;
  password: string;
  createdAt: string;
}

export interface CurrentUser {
  email: string;
  name: string;
}

/**
 * Get current logged-in user
 */
export function getCurrentUser(): CurrentUser | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

/**
 * Save current user session
 */
export function saveCurrentUser(user: CurrentUser): void {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
}

/**
 * Clear current user session
 */
export function clearCurrentUser(): void {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

/**
 * Get all farms for current user
 */
export function getUserFarms(userEmail: string): Farm[] {
  try {
    const allFarms = localStorage.getItem(STORAGE_KEYS.FARMS);
    if (!allFarms) return [];
    
    const farmsData: Record<string, Farm[]> = JSON.parse(allFarms);
    return farmsData[userEmail] || [];
  } catch {
    return [];
  }
}

/**
 * Save farms for current user
 */
export function saveUserFarms(userEmail: string, farms: Farm[]): void {
  try {
    const allFarms = localStorage.getItem(STORAGE_KEYS.FARMS);
    const farmsData: Record<string, Farm[]> = allFarms ? JSON.parse(allFarms) : {};
    
    farmsData[userEmail] = farms;
    localStorage.setItem(STORAGE_KEYS.FARMS, JSON.stringify(farmsData));
  } catch (error) {
    console.error('Error saving farms:', error);
  }
}

/**
 * Add a new farm for user
 */
export function addUserFarm(userEmail: string, farm: Farm): void {
  const farms = getUserFarms(userEmail);
  farms.push(farm);
  saveUserFarms(userEmail, farms);
}

/**
 * Get farm data (sensor readings, etc.) for a specific farm
 */
export function getFarmData(userEmail: string, farmId: string): FarmData | null {
  try {
    const allFarmData = localStorage.getItem(STORAGE_KEYS.FARM_DATA);
    if (!allFarmData) return null;
    
    const farmDataByUser: Record<string, Record<string, FarmData>> = JSON.parse(allFarmData);
    return farmDataByUser[userEmail]?.[farmId] || null;
  } catch {
    return null;
  }
}

/**
 * Save farm data (sensor readings, etc.) for a specific farm
 */
export function saveFarmData(userEmail: string, farmId: string, data: FarmData): void {
  try {
    const allFarmData = localStorage.getItem(STORAGE_KEYS.FARM_DATA);
    const farmDataByUser: Record<string, Record<string, FarmData>> = allFarmData 
      ? JSON.parse(allFarmData) 
      : {};
    
    if (!farmDataByUser[userEmail]) {
      farmDataByUser[userEmail] = {};
    }
    
    farmDataByUser[userEmail][farmId] = data;
    localStorage.setItem(STORAGE_KEYS.FARM_DATA, JSON.stringify(farmDataByUser));
  } catch (error) {
    console.error('Error saving farm data:', error);
  }
}

/**
 * Get all farm data for user
 */
export function getAllUserFarmData(userEmail: string): FarmData[] {
  try {
    const allFarmData = localStorage.getItem(STORAGE_KEYS.FARM_DATA);
    if (!allFarmData) return [];
    
    const farmDataByUser: Record<string, Record<string, FarmData>> = JSON.parse(allFarmData);
    const userFarmData = farmDataByUser[userEmail] || {};
    
    return Object.values(userFarmData);
  } catch {
    return [];
  }
}

/**
 * Clear all data for current user (useful for logout)
 */
export function clearUserData(userEmail: string): void {
  try {
    // Clear farms
    const allFarms = localStorage.getItem(STORAGE_KEYS.FARMS);
    if (allFarms) {
      const farmsData: Record<string, Farm[]> = JSON.parse(allFarms);
      delete farmsData[userEmail];
      localStorage.setItem(STORAGE_KEYS.FARMS, JSON.stringify(farmsData));
    }
    
    // Clear farm data
    const allFarmData = localStorage.getItem(STORAGE_KEYS.FARM_DATA);
    if (allFarmData) {
      const farmDataByUser: Record<string, Record<string, FarmData>> = JSON.parse(allFarmData);
      delete farmDataByUser[userEmail];
      localStorage.setItem(STORAGE_KEYS.FARM_DATA, JSON.stringify(farmDataByUser));
    }
  } catch (error) {
    console.error('Error clearing user data:', error);
  }
}

/**
 * Export all user data (for backup)
 */
export function exportUserData(userEmail: string): string {
  const farms = getUserFarms(userEmail);
  const farmData = getAllUserFarmData(userEmail);
  
  return JSON.stringify({
    email: userEmail,
    farms,
    farmData,
    exportedAt: new Date().toISOString(),
  }, null, 2);
}

/**
 * Import user data (from backup)
 */
export function importUserData(userEmail: string, dataString: string): boolean {
  try {
    const data = JSON.parse(dataString);
    
    if (data.email !== userEmail) {
      console.error('Email mismatch in import data');
      return false;
    }
    
    // Save farms
    if (data.farms) {
      saveUserFarms(userEmail, data.farms);
    }
    
    // Save farm data
    if (data.farmData) {
      data.farmData.forEach((fd: FarmData) => {
        saveFarmData(userEmail, fd.farm.id, fd);
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error importing user data:', error);
    return false;
  }
}

/**
 * Get storage usage info
 */
export function getStorageInfo(): {
  used: number;
  available: number;
  percentage: number;
} {
  try {
    let totalSize = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length + key.length;
      }
    }
    
    // LocalStorage typically has 5-10MB limit, we'll use 5MB as baseline
    const available = 5 * 1024 * 1024; // 5MB in bytes
    const percentage = (totalSize / available) * 100;
    
    return {
      used: totalSize,
      available: available - totalSize,
      percentage: Math.min(percentage, 100),
    };
  } catch {
    return { used: 0, available: 0, percentage: 0 };
  }
}

// ===== Farmer Profile Functions =====

/**
 * Get farmer profile
 */
export function getFarmerProfile(userEmail: string): FarmerProfile | null {
  try {
    const allProfiles = localStorage.getItem(STORAGE_KEYS.FARMER_PROFILES);
    if (!allProfiles) return null;
    
    const profiles: Record<string, FarmerProfile> = JSON.parse(allProfiles);
    return profiles[userEmail] || null;
  } catch {
    return null;
  }
}

/**
 * Save or update farmer profile
 */
export function saveFarmerProfile(profile: FarmerProfile): void {
  try {
    const allProfiles = localStorage.getItem(STORAGE_KEYS.FARMER_PROFILES);
    const profiles: Record<string, FarmerProfile> = allProfiles ? JSON.parse(allProfiles) : {};
    
    profiles[profile.email] = profile;
    localStorage.setItem(STORAGE_KEYS.FARMER_PROFILES, JSON.stringify(profiles));
  } catch (error) {
    console.error('Error saving farmer profile:', error);
  }
}

// ===== Crop Management Functions =====

/**
 * Get all crops for a user
 */
export function getUserCrops(userEmail: string): Crop[] {
  try {
    const allCrops = localStorage.getItem(STORAGE_KEYS.CROPS);
    if (!allCrops) return [];
    
    const cropsData: Record<string, Crop[]> = JSON.parse(allCrops);
    return cropsData[userEmail] || [];
  } catch {
    return [];
  }
}

/**
 * Get crops for a specific farm
 */
export function getFarmCrops(userEmail: string, farmId: string): Crop[] {
  const allCrops = getUserCrops(userEmail);
  return allCrops.filter(crop => crop.farmId === farmId);
}

/**
 * Add a new crop
 */
export function addCrop(userEmail: string, crop: Crop): void {
  const crops = getUserCrops(userEmail);
  crops.push(crop);
  saveCrops(userEmail, crops);
}

/**
 * Update a crop
 */
export function updateCrop(userEmail: string, cropId: string, updates: Partial<Crop>): void {
  const crops = getUserCrops(userEmail);
  const index = crops.findIndex(c => c.id === cropId);
  if (index !== -1) {
    crops[index] = { ...crops[index], ...updates };
    saveCrops(userEmail, crops);
  }
}

/**
 * Delete a crop
 */
export function deleteCrop(userEmail: string, cropId: string): void {
  const crops = getUserCrops(userEmail).filter(c => c.id !== cropId);
  saveCrops(userEmail, crops);
}

/**
 * Save crops for user
 */
function saveCrops(userEmail: string, crops: Crop[]): void {
  try {
    const allCrops = localStorage.getItem(STORAGE_KEYS.CROPS);
    const cropsData: Record<string, Crop[]> = allCrops ? JSON.parse(allCrops) : {};
    
    cropsData[userEmail] = crops;
    localStorage.setItem(STORAGE_KEYS.CROPS, JSON.stringify(cropsData));
  } catch (error) {
    console.error('Error saving crops:', error);
  }
}

// ===== Soil Record Functions =====

/**
 * Get all soil records for a user
 */
export function getUserSoilRecords(userEmail: string): SoilRecord[] {
  try {
    const allRecords = localStorage.getItem(STORAGE_KEYS.SOIL_RECORDS);
    if (!allRecords) return [];
    
    const recordsData: Record<string, SoilRecord[]> = JSON.parse(allRecords);
    return recordsData[userEmail] || [];
  } catch {
    return [];
  }
}

/**
 * Get soil records for a specific farm
 */
export function getFarmSoilRecords(userEmail: string, farmId: string): SoilRecord[] {
  const allRecords = getUserSoilRecords(userEmail);
  return allRecords.filter(record => record.farmId === farmId);
}

/**
 * Add a new soil record
 */
export function addSoilRecord(userEmail: string, record: SoilRecord): void {
  const records = getUserSoilRecords(userEmail);
  records.push(record);
  saveSoilRecords(userEmail, records);
}

/**
 * Save soil records for user
 */
function saveSoilRecords(userEmail: string, records: SoilRecord[]): void {
  try {
    const allRecords = localStorage.getItem(STORAGE_KEYS.SOIL_RECORDS);
    const recordsData: Record<string, SoilRecord[]> = allRecords ? JSON.parse(allRecords) : {};
    
    recordsData[userEmail] = records;
    localStorage.setItem(STORAGE_KEYS.SOIL_RECORDS, JSON.stringify(recordsData));
  } catch (error) {
    console.error('Error saving soil records:', error);
  }
}

// ===== Fertilizer Advice Functions =====

/**
 * Get all fertilizer advice for a user
 */
export function getUserFertilizerAdvice(userEmail: string): FertilizerAdvice[] {
  try {
    const allAdvice = localStorage.getItem(STORAGE_KEYS.FERTILIZER_ADVICE);
    if (!allAdvice) return [];
    
    const adviceData: Record<string, FertilizerAdvice[]> = JSON.parse(allAdvice);
    return adviceData[userEmail] || [];
  } catch {
    return [];
  }
}

/**
 * Get fertilizer advice for a specific farm
 */
export function getFarmFertilizerAdvice(userEmail: string, farmId: string): FertilizerAdvice[] {
  const allAdvice = getUserFertilizerAdvice(userEmail);
  return allAdvice.filter(advice => advice.farmId === farmId);
}

/**
 * Add new fertilizer advice
 */
export function addFertilizerAdvice(userEmail: string, advice: FertilizerAdvice): void {
  const allAdvice = getUserFertilizerAdvice(userEmail);
  allAdvice.push(advice);
  saveFertilizerAdvice(userEmail, allAdvice);
}

/**
 * Save fertilizer advice for user
 */
function saveFertilizerAdvice(userEmail: string, advice: FertilizerAdvice[]): void {
  try {
    const allAdvice = localStorage.getItem(STORAGE_KEYS.FERTILIZER_ADVICE);
    const adviceData: Record<string, FertilizerAdvice[]> = allAdvice ? JSON.parse(allAdvice) : {};
    
    adviceData[userEmail] = advice;
    localStorage.setItem(STORAGE_KEYS.FERTILIZER_ADVICE, JSON.stringify(adviceData));
  } catch (error) {
    console.error('Error saving fertilizer advice:', error);
  }
}

// ===== Weather Alert Functions =====

/**
 * Get all weather alerts for a user
 */
export function getUserWeatherAlerts(userEmail: string): WeatherAlert[] {
  try {
    const allAlerts = localStorage.getItem(STORAGE_KEYS.WEATHER_ALERTS);
    if (!allAlerts) return [];
    
    const alertsData: Record<string, WeatherAlert[]> = JSON.parse(allAlerts);
    return alertsData[userEmail] || [];
  } catch {
    return [];
  }
}

/**
 * Get weather alerts for a specific farm
 */
export function getFarmWeatherAlerts(userEmail: string, farmId: string): WeatherAlert[] {
  const allAlerts = getUserWeatherAlerts(userEmail);
  return allAlerts.filter(alert => alert.farmId === farmId);
}

/**
 * Add new weather alert
 */
export function addWeatherAlert(userEmail: string, alert: WeatherAlert): void {
  const alerts = getUserWeatherAlerts(userEmail);
  alerts.push(alert);
  saveWeatherAlerts(userEmail, alerts);
}

/**
 * Save weather alerts for user
 */
function saveWeatherAlerts(userEmail: string, alerts: WeatherAlert[]): void {
  try {
    const allAlerts = localStorage.getItem(STORAGE_KEYS.WEATHER_ALERTS);
    const alertsData: Record<string, WeatherAlert[]> = allAlerts ? JSON.parse(allAlerts) : {};
    
    alertsData[userEmail] = alerts;
    localStorage.setItem(STORAGE_KEYS.WEATHER_ALERTS, JSON.stringify(alertsData));
  } catch (error) {
    console.error('Error saving weather alerts:', error);
  }
}

/**
 * Delete a farm and all its associated data
 */
export function deleteFarm(userEmail: string, farmId: string): void {
  try {
    // Remove from farms list
    const farms = getUserFarms(userEmail).filter(f => f.id !== farmId);
    saveUserFarms(userEmail, farms);
    
    // Remove farm data
    const allFarmData = localStorage.getItem(STORAGE_KEYS.FARM_DATA);
    if (allFarmData) {
      const farmDataByUser: Record<string, Record<string, FarmData>> = JSON.parse(allFarmData);
      if (farmDataByUser[userEmail]) {
        delete farmDataByUser[userEmail][farmId];
        localStorage.setItem(STORAGE_KEYS.FARM_DATA, JSON.stringify(farmDataByUser));
      }
    }
    
    // Remove crops for this farm
    const crops = getUserCrops(userEmail).filter(c => c.farmId !== farmId);
    saveCrops(userEmail, crops);
    
    // Remove soil records for this farm
    const soilRecords = getUserSoilRecords(userEmail).filter(r => r.farmId !== farmId);
    saveSoilRecords(userEmail, soilRecords);
    
    // Remove fertilizer advice for this farm
    const fertilizerAdvice = getUserFertilizerAdvice(userEmail).filter(a => a.farmId !== farmId);
    saveFertilizerAdvice(userEmail, fertilizerAdvice);
    
    // Remove weather alerts for this farm
    const weatherAlerts = getUserWeatherAlerts(userEmail).filter(a => a.farmId !== farmId);
    saveWeatherAlerts(userEmail, weatherAlerts);
  } catch (error) {
    console.error('Error deleting farm:', error);
  }
}