import { useState, useEffect } from "react";

// Import all components
import { SoilParametersPage } from "./SoilParametersPage";
import { IrrigationPage } from "./IrrigationPage";
import { WeatherPage } from "./WeatherPage";
import { CropHealthMonitoring } from "./CropHealthMonitoring";
import { PestDetection } from "./PestDetection";
import { EnvironmentalRisk } from "./EnvironmentalRisk";
import { FarmerAdvisory } from "./FarmerAdvisory";
import { AnalyticsDashboard } from "./AnalyticsDashboard";
import { SoilDataEntryPage } from "./SoilDataEntryPage";
import { FarmerProfilePage } from "./FarmerProfilePage";
import { AddCropPage } from "./AddCropPage";

import { farms as initialFarms, getAllFarmsData } from "../utils/mockData";
import { FarmData, Farm, IrrigationMode } from "../types";

import { 
  Leaf, Plus, X, Sprout, Heart, Bug, AlertTriangle, 
  Bell, Activity, Droplet, Cloud, TrendingUp, 
  BarChart3, Calendar, Menu, Home, Shield, Award, Target,
  Wind, Thermometer, MapPin, ArrowLeft
} from "lucide-react";

import { getUserFarms, saveUserFarms } from "../services/storageService";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ✅ Define SidebarPage type here (no import from Sidebar)
export type SidebarPage = 
  | 'dashboard' 
  | 'add-crop' 
  | 'profile';

// Map dashboard tabs back to sidebar pages
export const tabToSidebarMap: Record<string, SidebarPage> = {
  'overview': 'dashboard',
  'add-crop': 'add-crop',
  'profile': 'profile'
};

/* =========================
   LIVE SENSOR TYPE
========================= */
interface LiveSoilData {
  moisture: number;
  humidity: number;
  temperature: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  ph: number;
  ec: number;
}

const DEFAULT_SOIL: LiveSoilData = {
  moisture: 0,
  humidity: 0,
  temperature: 0,
  nitrogen: 0,
  phosphorus: 0,
  potassium: 0,
  ph: 7,
  ec: 0,
};

const DEFAULT_PREDICTION = {
  recommended_crop: "Loading...",
  fertilizer: "Loading...",
};

const DEFAULT_API_URL = "http://127.0.0.1:5000";

/* =========================
   CROP SUITABILITY REFERENCE
========================= */
interface CropProfile {
  name: string;
  ph: [number, number];
  nitrogen: [number, number];
  phosphorus: [number, number];
  potassium: [number, number];
}

const CROP_DATABASE: CropProfile[] = [
  { name: "Rice", ph: [5.5, 6.5], nitrogen: [80, 120], phosphorus: [30, 60], potassium: [30, 60] },
  { name: "Wheat", ph: [6.0, 7.5], nitrogen: [80, 120], phosphorus: [40, 60], potassium: [30, 50] },
  { name: "Maize", ph: [5.8, 7.0], nitrogen: [100, 150], phosphorus: [50, 80], potassium: [40, 60] },
  { name: "Cotton", ph: [6.0, 7.5], nitrogen: [80, 120], phosphorus: [40, 60], potassium: [40, 60] },
  { name: "Sugarcane", ph: [6.0, 7.5], nitrogen: [120, 180], phosphorus: [50, 80], potassium: [60, 100] },
  { name: "Soybean", ph: [6.0, 7.0], nitrogen: [20, 40], phosphorus: [40, 60], potassium: [40, 60] },
  { name: "Groundnut", ph: [6.0, 7.0], nitrogen: [20, 30], phosphorus: [40, 60], potassium: [40, 60] },
  { name: "Sunflower", ph: [6.0, 7.5], nitrogen: [60, 90], phosphorus: [40, 60], potassium: [40, 60] },
  { name: "Chickpea", ph: [6.0, 7.5], nitrogen: [15, 25], phosphorus: [40, 60], potassium: [20, 40] },
  { name: "Pigeon Pea", ph: [6.0, 7.5], nitrogen: [15, 25], phosphorus: [40, 60], potassium: [20, 40] },
  { name: "Millet", ph: [5.5, 7.0], nitrogen: [40, 60], phosphorus: [20, 40], potassium: [20, 40] },
  { name: "Barley", ph: [6.0, 7.5], nitrogen: [60, 90], phosphorus: [30, 50], potassium: [20, 40] },
  { name: "Potato", ph: [5.0, 6.5], nitrogen: [100, 150], phosphorus: [50, 80], potassium: [80, 120] },
  { name: "Tomato", ph: [6.0, 6.8], nitrogen: [80, 120], phosphorus: [50, 80], potassium: [80, 120] },
  { name: "Onion", ph: [6.0, 7.0], nitrogen: [80, 100], phosphorus: [40, 60], potassium: [40, 60] },
  { name: "Grapes", ph: [6.0, 7.0], nitrogen: [40, 60], phosphorus: [30, 50], potassium: [60, 100] },
  { name: "Banana", ph: [6.0, 7.5], nitrogen: [100, 150], phosphorus: [30, 50], potassium: [150, 250] },
];

interface CropScore {
  cropName: string;
  found: boolean;
  score: number;
  profile: CropProfile | null;
}

interface CropComparisonResult {
  ranked: CropScore[];
  best: CropScore;
  fertilizerAdvice: string;
}

function normalizedDistance(value: number, range: [number, number]) {
  const [min, max] = range;
  if (value < min) return (min - value) / (max - min || 1);
  if (value > max) return (value - max) / (max - min || 1);
  return 0;
}

function scoreCropAgainstSoil(cropName: string, soil: LiveSoilData): CropScore {
  const profile = CROP_DATABASE.find(
    (c) => c.name.toLowerCase() === cropName.trim().toLowerCase()
  );

  if (!profile) {
    return { cropName, found: false, score: Infinity, profile: null };
  }

  const score =
    normalizedDistance(soil.ph, profile.ph) +
    normalizedDistance(soil.nitrogen, profile.nitrogen) +
    normalizedDistance(soil.phosphorus, profile.phosphorus) +
    normalizedDistance(soil.potassium, profile.potassium);

  return { cropName: profile.name, found: true, score, profile };
}

function buildFertilizerAdvice(best: CropScore, soil: LiveSoilData): string {
  if (!best.found || !best.profile) {
    return "This crop isn't in our reference list yet, so we can't tailor a fertilizer plan for it. Consult a local agronomist for a soil-specific recommendation.";
  }

  const { profile } = best;
  const advice: string[] = [];

  const nMid = (profile.nitrogen[0] + profile.nitrogen[1]) / 2;
  const pMid = (profile.phosphorus[0] + profile.phosphorus[1]) / 2;
  const kMid = (profile.potassium[0] + profile.potassium[1]) / 2;

  if (soil.nitrogen < profile.nitrogen[0]) {
    advice.push(`Apply Urea to raise Nitrogen toward ~${Math.round(nMid)} kg/ha.`);
  } else if (soil.nitrogen > profile.nitrogen[1]) {
    advice.push("Nitrogen is higher than needed — reduce or skip Urea this cycle.");
  }

  if (soil.phosphorus < profile.phosphorus[0]) {
    advice.push(`Apply DAP (Di-Ammonium Phosphate) to raise Phosphorus toward ~${Math.round(pMid)} kg/ha.`);
  } else if (soil.phosphorus > profile.phosphorus[1]) {
    advice.push("Phosphorus is already sufficient — no extra DAP needed.");
  }

  if (soil.potassium < profile.potassium[0]) {
    advice.push(`Apply MOP (Muriate of Potash) to raise Potassium toward ~${Math.round(kMid)} kg/ha.`);
  } else if (soil.potassium > profile.potassium[1]) {
    advice.push("Potassium is already sufficient — no extra MOP needed.");
  }

  if (soil.ph < profile.ph[0]) {
    advice.push("Soil is slightly acidic for this crop — consider agricultural lime.");
  } else if (soil.ph > profile.ph[1]) {
    advice.push("Soil is slightly alkaline for this crop — consider gypsum or organic compost.");
  }

  if (advice.length === 0) {
    advice.push("Soil nutrients are already within the ideal range for this crop — maintain with standard organic compost.");
  }

  return advice.join(" ");
}

function compareFarmerCrops(cropNames: string[], soil: LiveSoilData): CropComparisonResult | null {
  const cleaned = cropNames.map((c) => c.trim()).filter(Boolean);
  if (cleaned.length === 0) return null;

  const ranked = cleaned
    .map((name) => scoreCropAgainstSoil(name, soil))
    .sort((a, b) => a.score - b.score);

  const best = ranked[0];
  const fertilizerAdvice = buildFertilizerAdvice(best, soil);

  return { ranked, best, fertilizerAdvice };
}

/* =========================
   DASHBOARD
========================= */

type DashboardTab = 
  | "overview"
  | "soil"
  | "weather"
  | "irrigation"
  | "crophealth"
  | "recommendations"
  | "analytics";

interface DashboardProps {
  userEmail: string;
  currentPage?: SidebarPage;
  onNavigate?: (page: SidebarPage) => void;
}

export function Dashboard({ userEmail, currentPage = 'dashboard', onNavigate }: DashboardProps) {
  // If currentPage is 'profile', show FarmerProfilePage
  if (currentPage === 'profile') {
    return (
      <FarmerProfilePage 
        userEmail={userEmail}
        userName={userEmail?.split('@')[0] || 'Farmer'}
      />
    );
  }

  // If currentPage is 'add-crop', show AddCropPage
  if (currentPage === 'add-crop') {
    return (
      <AddCropPage 
        userEmail={userEmail}
        onCropAdded={() => {
          console.log('Crop added!');
        }}
      />
    );
  }

  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState("");
  const [farmsData, setFarmsData] = useState<FarmData[]>([]);
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [irrigationMode, setIrrigationMode] = useState<IrrigationMode>("smart");

  const [showAddFarm, setShowAddFarm] = useState(false);
  const [newFarmName, setNewFarmName] = useState("");
  const [newFarmLocation, setNewFarmLocation] = useState("");
  const [newFarmApiUrl, setNewFarmApiUrl] = useState("");

  const [liveSoilDataByFarm, setLiveSoilDataByFarm] = useState<Record<string, LiveSoilData>>({});
  const [sensorHistoryByFarm, setSensorHistoryByFarm] = useState<Record<string, any[]>>({});
  const [predictionByFarm, setPredictionByFarm] = useState<Record<string, any>>({});

  const [farmerCropOptions, setFarmerCropOptions] = useState<string[]>(["", "", ""]);
  const [cropComparison, setCropComparison] = useState<CropComparisonResult | null>(null);
  const [cropCompareError, setCropCompareError] = useState("");

  const liveSoilData = liveSoilDataByFarm[selectedFarmId] || DEFAULT_SOIL;
  const sensorHistory = sensorHistoryByFarm[selectedFarmId] || [];
  const prediction = predictionByFarm[selectedFarmId] || DEFAULT_PREDICTION;

  const selectedFarm = farms.find((f) => f.id === selectedFarmId);
  const apiBase = (selectedFarm as any)?.apiUrl || DEFAULT_API_URL;

  // Load farms on mount
  useEffect(() => {
    const userFarms = getUserFarms(userEmail);

    if (userFarms.length > 0) {
      setFarms(userFarms);
      setSelectedFarmId(userFarms[0].id);
    } else {
      const defaultFarm: Farm = {
        id: "farm-1",
        name: "Farm 1",
        location: "",
      } as Farm;
      setFarms([defaultFarm]);
      setSelectedFarmId(defaultFarm.id);
    }

    setFarmsData(getAllFarmsData());
  }, [userEmail]);

  // Fetch sensor data
  useEffect(() => {
    if (!selectedFarmId) return;

    const farmId = selectedFarmId;

    const fetchESP = async () => {
      try {
        const res = await fetch(`${apiBase}/api/data`);
        if (!res.ok) return;

        const data = await res.json();

        setLiveSoilDataByFarm((prev) => ({ ...prev, [farmId]: data }));

        setSensorHistoryByFarm((prev) => {
          const prevHistory = prev[farmId] || [];
          const nextHistory = [
            ...prevHistory,
            {
              time: new Date().toLocaleTimeString(),
              moisture: data.moisture || 0,
              ph: data.ph || 7,
              temperature: data.temperature || 0,
              nitrogen: data.nitrogen || 0,
              phosphorus: data.phosphorus || 0,
              potassium: data.potassium || 0,
            },
          ].slice(-20);
          return { ...prev, [farmId]: nextHistory };
        });

        setLastUpdate(new Date());
      } catch (err) {
        console.log("FETCH ERROR:", err);
      }
    };

    fetchESP();
    const interval = setInterval(fetchESP, 3000);
    return () => clearInterval(interval);
  }, [selectedFarmId, apiBase, refreshTrigger]);

  // Fetch ML prediction
  useEffect(() => {
    if (!selectedFarmId) return;

    const farmId = selectedFarmId;

    const fetchPrediction = async () => {
      try {
        const res = await fetch(`${apiBase}/api/predict`);
        if (!res.ok) return;

        const data = await res.json();
        setPredictionByFarm((prev) => ({ ...prev, [farmId]: data }));
      } catch (err) {
        console.log("ML ERROR:", err);
      }
    };

    fetchPrediction();
    const interval = setInterval(fetchPrediction, 5000);
    return () => clearInterval(interval);
  }, [selectedFarmId, apiBase, refreshTrigger]);

  // Handle soil data update callback
  const handleSoilDataUpdate = () => {
    setRefreshTrigger(prev => prev + 1);
    setLastUpdate(new Date());
  };

  const handleCropOptionChange = (index: number, value: string) => {
    setFarmerCropOptions((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleCompareCrops = () => {
    const filled = farmerCropOptions.filter((c) => c.trim());
    if (filled.length === 0) {
      setCropCompareError("Enter at least one crop to compare.");
      setCropComparison(null);
      return;
    }

    setCropCompareError("");
    const result = compareFarmerCrops(farmerCropOptions, liveSoilData);
    setCropComparison(result);
  };

  const handleAddFarm = () => {
    if (!newFarmName.trim()) return;

    const newFarm: Farm = {
      id: `farm-${Date.now()}`,
      name: newFarmName.trim(),
      location: newFarmLocation.trim(),
      ...(newFarmApiUrl.trim() ? { apiUrl: newFarmApiUrl.trim() } : {}),
    } as Farm;

    const updatedFarms = [...farms, newFarm];
    setFarms(updatedFarms);
    setSelectedFarmId(newFarm.id);

    try {
      saveUserFarms(userEmail, updatedFarms);
    } catch (err) {
      console.log("Could not persist new farm:", err);
    }

    setNewFarmName("");
    setNewFarmLocation("");
    setNewFarmApiUrl("");
    setShowAddFarm(false);
  };

  const handleDeleteFarm = (farmId: string) => {
    if (farmId === "farm-1") return;

    const updatedFarms = farms.filter((f) => f.id !== farmId);
    setFarms(updatedFarms);

    if (selectedFarmId === farmId) {
      setSelectedFarmId(updatedFarms[0]?.id || "");
    }

    setLiveSoilDataByFarm((prev) => {
      const next = { ...prev };
      delete next[farmId];
      return next;
    });
    setSensorHistoryByFarm((prev) => {
      const next = { ...prev };
      delete next[farmId];
      return next;
    });
    setPredictionByFarm((prev) => {
      const next = { ...prev };
      delete next[farmId];
      return next;
    });

    try {
      saveUserFarms(userEmail, updatedFarms);
    } catch (err) {
      console.log("Could not persist farm deletion:", err);
    }
  };

  // Quick access cards for dashboard overview
  const quickAccessCards = [
    { 
      id: 'soil' as DashboardTab, 
      label: 'Soil Monitoring', 
      icon: Droplet, 
      color: 'green',
      description: 'Check soil health and nutrients',
      bgColor: 'bg-green-100',
      hoverColor: 'hover:border-green-300'
    },
    { 
      id: 'weather' as DashboardTab, 
      label: 'Weather', 
      icon: Cloud, 
      color: 'blue',
      description: 'View current weather conditions',
      bgColor: 'bg-blue-100',
      hoverColor: 'hover:border-blue-300'
    },
    { 
      id: 'irrigation' as DashboardTab, 
      label: 'Irrigation', 
      icon: Droplet, 
      color: 'cyan',
      description: 'Manage irrigation schedules',
      bgColor: 'bg-cyan-100',
      hoverColor: 'hover:border-cyan-300'
    },
    { 
      id: 'crophealth' as DashboardTab, 
      label: 'Crop Health & Risks', 
      icon: Heart, 
      color: 'red',
      description: 'Monitor crop health and detect risks',
      bgColor: 'bg-red-100',
      hoverColor: 'hover:border-red-300'
    },
    { 
      id: 'recommendations' as DashboardTab, 
      label: 'Crop & Fertilizer Recommendations', 
      icon: Sprout, 
      color: 'purple',
      description: 'AI-powered recommendations',
      bgColor: 'bg-purple-100',
      hoverColor: 'hover:border-purple-300'
    },
    { 
      id: 'analytics' as DashboardTab, 
      label: 'Analytics & History', 
      icon: TrendingUp, 
      color: 'indigo',
      description: 'View historical trends and reports',
      bgColor: 'bg-indigo-100',
      hoverColor: 'hover:border-indigo-300'
    },
  ];

  // Helper function to render back button and page header
  const renderPageHeader = (title: string, icon: any, color: string, description: string) => {
    const Icon = icon;
    return (
      <div className="mb-6">
        <button
          onClick={() => setActiveTab("overview")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Dashboard</span>
        </button>
        <div className="flex items-center gap-3">
          <div className={`p-3 ${color === 'green' ? 'bg-green-100' : color === 'blue' ? 'bg-blue-100' : color === 'cyan' ? 'bg-cyan-100' : color === 'red' ? 'bg-red-100' : color === 'purple' ? 'bg-purple-100' : 'bg-indigo-100'} rounded-xl`}>
            <Icon className={`w-6 h-6 text-${color}-600`} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{title}</h2>
            <p className="text-gray-500 text-sm">{description}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="bg-white shadow-sm p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Leaf className="text-green-600" />
          <div>
            <h1 className="text-xl font-bold">Bhoomi Dashboard</h1>
            <p className="text-sm text-gray-500">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
        </div>
        <div className="text-sm text-gray-500 hidden md:block">
          Welcome, {userEmail?.split('@')[0] || 'Farmer'}
        </div>
      </header>

      {/* FARM SWITCHER */}
      <div className="bg-white border-b px-4 py-3 flex items-center gap-2 flex-wrap">
        {farms.map((farm) => (
          <div
            key={farm.id}
            className={`flex items-center gap-1 pl-4 pr-2 py-2 rounded-full text-sm font-medium transition ${
              selectedFarmId === farm.id
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <button onClick={() => setSelectedFarmId(farm.id)}>
              {farm.name}
            </button>

            {farm.id !== "farm-1" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteFarm(farm.id);
                }}
                className={`ml-1 rounded-full p-0.5 hover:bg-black/10 ${
                  selectedFarmId === farm.id ? "text-white" : "text-gray-500"
                }`}
                title="Remove farm"
              >
                <X size={14} />
              </button>
            )}
          </div>
        ))}

        <button
          onClick={() => setShowAddFarm(true)}
          className="flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium bg-green-50 text-green-700 border border-dashed border-green-400 hover:bg-green-100"
        >
          <Plus size={16} /> Add Farm
        </button>
      </div>

      {/* ADD FARM MODAL */}
      {showAddFarm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Add New Farm</h2>
              <button onClick={() => setShowAddFarm(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">Farm name</label>
                <input
                  className="w-full border rounded p-2 mt-1"
                  placeholder="e.g. Farm 3"
                  value={newFarmName}
                  onChange={(e) => setNewFarmName(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Location</label>
                <input
                  className="w-full border rounded p-2 mt-1"
                  placeholder="e.g. Sholapur"
                  value={newFarmLocation}
                  onChange={(e) => setNewFarmLocation(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">
                  Sensor API URL (optional)
                </label>
                <input
                  className="w-full border rounded p-2 mt-1"
                  placeholder="http://192.168.x.x:5000"
                  value={newFarmApiUrl}
                  onChange={(e) => setNewFarmApiUrl(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setShowAddFarm(false)}
                className="px-4 py-2 rounded bg-gray-100 text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleAddFarm}
                className="px-4 py-2 rounded bg-green-600 text-white"
              >
                Add Farm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT */}

      {/* OVERVIEW - Dashboard with Cards */}
      {activeTab === "overview" && (
        <div className="p-4 max-w-7xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Home className="text-green-600" />
              Dashboard Overview
            </h2>
            <p className="text-gray-500 text-sm">
              Welcome back! Here's a quick overview of your farm
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Sprout className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Crops</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Leaf className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Healthy Crops</p>
                  <p className="text-2xl font-bold text-green-600">87%</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Active Alerts</p>
                  <p className="text-2xl font-bold text-yellow-600">3</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Farm Status</p>
                  <p className="text-2xl font-bold text-green-600">Active</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Access Cards - 6 cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickAccessCards.map((card) => {
              const Icon = card.icon;
              return (
                <div 
                  key={card.id}
                  className={`bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow cursor-pointer ${card.hoverColor}`}
                  onClick={() => setActiveTab(card.id)}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 ${card.bgColor} rounded-lg`}>
                      <Icon className={`w-5 h-5 text-${card.color}-600`} />
                    </div>
                    <h3 className="font-semibold">{card.label}</h3>
                  </div>
                  <p className="text-sm text-gray-500">{card.description}</p>
                  <div className={`mt-3 text-xs text-${card.color}-600`}>View Details →</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SOIL MONITORING */}
      {activeTab === "soil" && (
        <div className="p-4 max-w-7xl mx-auto">
          {renderPageHeader(
            'Soil Monitoring',
            Droplet,
            'green',
            `Live sensor values and manual soil data entry for ${selectedFarm?.name}`
          )}

          <SoilParametersPage soilData={liveSoilData} />

          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h3 className="font-semibold mb-4">Live Sensor Graph — {selectedFarm?.name}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={sensorHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="moisture" stroke="#2563eb" />
                <Line type="monotone" dataKey="ph" stroke="#16a34a" />
                <Line type="monotone" dataKey="temperature" stroke="#dc2626" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6">
            <SoilDataEntryPage 
              userEmail={userEmail}
              selectedFarmId={selectedFarmId}
              onSoilDataUpdate={handleSoilDataUpdate}
            />
          </div>
        </div>
      )}

      {/* WEATHER - Separate Page */}
      {activeTab === "weather" && (
        <div className="p-4 max-w-7xl mx-auto">
          {renderPageHeader(
            'Weather',
            Cloud,
            'blue',
            `Current weather conditions and forecast for ${selectedFarm?.name}`
          )}
          <WeatherPage weather={undefined} recommendations={[]} />
        </div>
      )}

      {/* IRRIGATION - Separate Page with Back Button */}
      {activeTab === "irrigation" && (
        <div className="p-4 max-w-7xl mx-auto">
          {renderPageHeader(
            'Irrigation Management',
            Droplet,
            'cyan',
            `Smart irrigation scheduling and management for ${selectedFarm?.name}`
          )}
          <IrrigationPage
            mode={irrigationMode}
            status={{
              active: false,
              flowRate: 0,
              duration: 0,
              lastIrrigated: new Date().toISOString(),
            }}
            recommendations={[
              {
                id: "rec-1",
                title: "Crop Recommendation",
                description: "AI prediction from backend",
                message: `Best crop: ${prediction.recommended_crop}`,
                priority: "medium",
                confidence: 90,
                crops: [prediction.recommended_crop],
                fertilizers: [prediction.fertilizer],
              },
            ]}
            onModeChange={setIrrigationMode}
            onToggleIrrigation={() => {}}
          />
        </div>
      )}

      {/* CROP HEALTH & RISKS */}
      {activeTab === "crophealth" && (
        <div className="p-4 max-w-7xl mx-auto">
          {renderPageHeader(
            'Crop Health & Risks',
            Heart,
            'red',
            `AI-powered crop monitoring, pest detection, and risk assessment for ${selectedFarm?.name}`
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CropHealthMonitoring fieldId={selectedFarmId} />
            <PestDetection fieldId={selectedFarmId} />
            <EnvironmentalRisk fieldId={selectedFarmId} />
            <FarmerAdvisory fieldId={selectedFarmId} />
          </div>
        </div>
      )}

      {/* RECOMMENDATIONS */}
      {activeTab === "recommendations" && (
        <div className="p-4 max-w-7xl mx-auto">
          {renderPageHeader(
            'Crop & Fertilizer Recommendations',
            Sprout,
            'purple',
            `AI-powered crop and fertilizer recommendations for ${selectedFarm?.name}`
          )}

          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Sprout className="text-green-600" />
              Recommended Crop
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <p className="text-sm text-gray-600 mb-1">Best Crop for Your Soil</p>
                <p className="text-3xl font-bold text-green-700">{prediction.recommended_crop}</p>
              </div>
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600 mb-1">Recommended Fertilizer</p>
                <p className="text-3xl font-bold text-blue-700">{prediction.fertilizer}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <div className="flex items-center gap-2 mb-2">
              <Sprout className="text-green-600" size={20} />
              <h3 className="text-lg font-semibold">Compare your own crop options</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Enter 2-3 crops you're considering. We'll check them against current soil readings.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {farmerCropOptions.map((crop, idx) => (
                <input
                  key={idx}
                  className="border rounded p-2"
                  placeholder={`Crop option ${idx + 1}`}
                  value={crop}
                  onChange={(e) => handleCropOptionChange(idx, e.target.value)}
                />
              ))}
            </div>

            {cropCompareError && (
              <p className="text-sm text-red-600 mt-2">{cropCompareError}</p>
            )}

            <button
              onClick={handleCompareCrops}
              className="mt-4 px-4 py-2 rounded bg-green-600 text-white text-sm font-medium hover:bg-green-700"
            >
              Compare Crops
            </button>

            {cropComparison && (
              <div className="mt-6 border-t pt-5">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600 mb-1">Best fit for this soil</p>
                  <p className="text-lg font-semibold text-green-700">
                    {cropComparison.best.cropName}
                  </p>
                  <p className="text-sm text-gray-700 mt-2">{cropComparison.fertilizerAdvice}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Ranking:</p>
                  {cropComparison.ranked.map((c, idx) => (
                    <div
                      key={`${c.cropName}-${idx}`}
                      className={`flex justify-between items-center p-3 rounded border ${
                        idx === 0
                          ? "border-green-300 bg-green-50"
                          : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <span className="font-medium">
                        {idx + 1}. {c.cropName}
                      </span>
                      <span className="text-sm text-gray-500">
                        {c.found ? (idx === 0 ? "Best match" : "Less suitable") : "Not in reference list"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ANALYTICS & HISTORY */}
      {activeTab === "analytics" && (
        <div className="p-4 max-w-7xl mx-auto">
          {renderPageHeader(
            'Analytics & History',
            TrendingUp,
            'indigo',
            `Historical trends, reports, and performance analytics for ${selectedFarm?.name}`
          )}
          
          <AnalyticsDashboard fieldId={selectedFarmId} />
          
          <div className="mt-6">
            <SoilDataEntryPage 
              userEmail={userEmail}
              selectedFarmId={selectedFarmId}
              onSoilDataUpdate={handleSoilDataUpdate}
              defaultView="history"
            />
          </div>
        </div>
      )}
    </div>
  );
}