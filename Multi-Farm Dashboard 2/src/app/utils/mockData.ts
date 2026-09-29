import { FarmData, Farm } from '../types';
import { Zone } from "../services/weatherApi";

// ---------------- FARMS ----------------
export const farms: Farm[] = [
  { id: '1', name: 'Farm 1', location: 'Pune, Maharashtra', area: 12.5 },
  { id: '2', name: 'Farm 2', location: 'Nashik, Maharashtra', area: 18.75 },
  { id: '3', name: 'Farm 3', location: 'Aurangabad, Maharashtra', area: 25 },
  { id: '4', name: 'Farm 4', location: 'Solapur, Maharashtra', area: 15 },
];

// ---------------- ZONES ----------------
const generateZones = (farmId: string): Zone[] => {
  const zoneCount = 8;
  const zones: Zone[] = [];

  for (let i = 0; i < zoneCount; i++) {
    const moistureValue = Math.floor(Math.random() * 80) + 10;

    let moistureLevel: 'dry' | 'medium' | 'wet';
    if (moistureValue < 30) moistureLevel = 'dry';
    else if (moistureValue < 60) moistureLevel = 'medium';
    else moistureLevel = 'wet';

    zones.push({
      id: `${farmId}-zone-${i + 1}`,
      name: `Zone ${String.fromCharCode(65 + i)}`,
      area: Math.floor(Math.random() * 5) + 1,

      moistureLevel,
      irrigationStatus: 'idle',

      lastIrrigation: new Date().toISOString(),

      soilData: {
        nitrogen: Math.floor(Math.random() * 60) + 10,
        phosphorus: Math.floor(Math.random() * 45) + 5,
        potassium: Math.floor(Math.random() * 250) + 50,
        ec: Math.random() * 3 + 0.5,
        humidity: Math.floor(Math.random() * 40) + 40,
        ph: Math.random() * 4 + 5,
        moisture: moistureValue,
        temperature: Math.floor(Math.random() * 10) + 25,
      },
    });
  }

  return zones;
};

// ---------------- FARM DATA ----------------
export const generateFarmData = (farm: Farm): FarmData => {
  const zones = generateZones(farm.id);

  const avgMoisture =
    zones.reduce((sum, z) => sum + z.soilData.moisture, 0) / zones.length;

  const dryZones = zones.filter(z => z.moistureLevel === 'dry').length;

  const rainProbability = Math.floor(Math.random() * 100);

  const recommendations: any[] = [];

  // ---------------- ML LOGIC ----------------
  if (dryZones > 3 && rainProbability < 30) {
    recommendations.push({
      id: '1',
      title: 'Immediate Irrigation Recommended',
      message: `${dryZones} zones detected with low moisture levels. No rain forecast.`,
      priority: 'high',
      confidence: 92,
    });
  }

  if (rainProbability > 60) {
    recommendations.push({
      id: '2',
      title: 'Delay Irrigation',
      message: `High rain probability (${rainProbability}%).`,
      priority: 'medium',
      confidence: 85,
    });
  }

  // ---------------- SOIL ----------------
  const soilData = {
    nitrogen: Math.floor(Math.random() * 60) + 10,
    phosphorus: Math.floor(Math.random() * 45) + 5,
    potassium: Math.floor(Math.random() * 250) + 50,
    ec: Math.random() * 3 + 0.5,
    humidity: Math.floor(Math.random() * 40) + 40,
    ph: Math.random() * 4 + 5,
    moisture: Math.floor(avgMoisture),
    temperature: Math.floor(Math.random() * 10) + 25,
  };

  // ---------------- WEATHER ----------------
  const weatherData = {
    temperature: Math.floor(Math.random() * 10) + 28,
    humidity: Math.floor(Math.random() * 30) + 60,
    windSpeed: Math.floor(Math.random() * 15) + 10,
    rainfall: Math.floor(Math.random() * 15),
    rainProbability,
    forecast: [],
  };

  return {
    farm,
    soilData,
    weatherData,
    zones,

    irrigationMode: 'smart',

    irrigationStatus: {
      active: avgMoisture < 40 && rainProbability < 50,
      flowRate: Math.floor(Math.random() * 50) + 100,
      duration: Math.floor(Math.random() * 180),
    },

    recommendations,
  };
};

// ---------------- ALL FARMS ----------------
export const getAllFarmsData = (): FarmData[] => {
  return farms.map(farm => generateFarmData(farm));
};

// ---------------- FIX FOR YOUR ERROR ----------------
export function shouldDelayIrrigation(
  rainProbability: number,
  forecast: any[]
): boolean {
  return rainProbability > 60;
}