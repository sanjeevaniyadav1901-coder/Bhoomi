// ================= REMOVE THIS (IMPORTANT)
// import { Zone } from "./services/weatherApi";

import { ReactNode } from "react";

// ---------------- FARM ----------------
export interface Farm {
  id: string;
  name: string;
  location: string;
  area: number;
}

// ---------------- FARMER ----------------
export interface FarmerProfile {
  email: string;
  firstName: string;
  surname: string;
  village: string;
  contactNumber: string;
  landSize: number;
  soilType: string;
  createdAt: string;
}

// ---------------- CROP ----------------
export interface Crop {
  id: string;
  farmId: string;
  name: string;
  variety: string;
  plantedDate: string;
  expectedHarvestDate: string;
  stage: 'seedling' | 'vegetative' | 'flowering' | 'fruiting' | 'harvesting';
  health: 'excellent' | 'good' | 'fair' | 'poor';
  area: number;
  notes?: string;
}

// ---------------- SOIL RECORD ----------------
// ---------------- SOIL RECORD ----------------
export interface SoilRecord {
  id: string;
  farmId: string;
  recordDate: string;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  ec: number;
  humidity: number;
  ph: number;
  moisture: number;
  notes?: string;
}

// ---------------- FERTILIZER ----------------
export interface FertilizerAdvice {
  id: string;
  farmId: string;
  cropId?: string;
  date: string;
  recommendation: string;
  npkRatio: string;
  quantity: number;
  applicationMethod: string;
  timing: string;
}
// ---------------- WEATHER ALERT ----------------
export interface WeatherAlert {
  id: string;
  farmId: string;
  date: string;
  type: 'rain' | 'drought' | 'frost' | 'heatwave' | 'wind';
  severity: 'low' | 'medium' | 'high';
  message: string;
  actionRequired: string;
}

// ---------------- IRRIGATION ----------------
export type IrrigationMode = 'smart' | 'manual' | 'scheduled';

export interface IrrigationStatus {
  active: boolean;
  flowRate: number;
  duration: number;
  nextScheduled?: string;
  lastIrrigated?: string;
}

// ---------------- ZONE ----------------
export type ZoneStatus = "dry" | "medium" | "wet";

export interface Zone {
  nextScheduled: boolean;
  lastIrrigation: any;
  soilData: any;
  area: ReactNode;
  irrigationStatus: string;
  moistureLevel: string;
  id: string;
  name: string;
  status: ZoneStatus;
  moisture: number;
}

// ---------------- WEATHER ----------------
export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  rainfall: number;
  rainProbability: number;
  condition: string;
  forecast?: any[];
}

// ---------------- SOIL ----------------
export interface SoilData {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  ph: number;
  moisture: number;
  ec: number;
  humidity: number;
  temperature: number;
}

// ---------------- ML ----------------
export interface MLRecommendation {
  id: string;
  title: string;
  description: string;
  message: string;
  priority: "high" | "medium" | "low";
  confidence: number;
  crops: string[];
  fertilizers: string[];
}
// ---------------- MAIN DASHBOARD ----------------
export interface FarmData {
  farm: Farm;
  soilData: SoilData;
  weatherData: WeatherData;
  zones: Zone[];
  irrigationMode: IrrigationMode;
  irrigationStatus: IrrigationStatus;
  recommendations: MLRecommendation[];
}