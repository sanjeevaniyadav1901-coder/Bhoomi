import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";

import { SoilData } from "../types";
import { Droplet, TestTube, Zap } from "lucide-react";
import { useEffect, useState } from "react";

interface SoilParametersPageProps {
  soilData: SoilData;
}

export function SoilParametersPage({
  soilData,
}: SoilParametersPageProps) {

  /* ===========================
     NPK PARAMETERS
  =========================== */

  const parameters: {
    name: string;
    value: number;
    unit: string;
    optimal: [number, number];
    color: string;
  }[] = [
    {
      name: "N",
      value: soilData.nitrogen,
      unit: "mg/kg",
      optimal: [20, 50],
      color: "#3b82f6",
    },
    {
      name: "P",
      value: soilData.phosphorus,
      unit: "mg/kg",
      optimal: [15, 40],
      color: "#8b5cf6",
    },
    {
      name: "K",
      value: soilData.potassium,
      unit: "mg/kg",
      optimal: [100, 300],
      color: "#ec4899",
    },
  ];

  const getStatusColor = (
    value: number,
    optimal: [number, number]
  ) => {
    if (value < optimal[0]) return "text-red-600";
    if (value > optimal[1]) return "text-orange-600";
    return "text-green-600";
  };

  const getStatusText = (
    value: number,
    optimal: [number, number]
  ) => {
    if (value < optimal[0]) return "Low";
    if (value > optimal[1]) return "High";
    return "Optimal";
  };

  /* ===========================
     REAL-TIME GRAPH DATA
  =========================== */

  const [liveHistory, setLiveHistory] = useState<any[]>([]);

  useEffect(() => {

    const newEntry = {
      time: new Date().toLocaleTimeString(),

      moisture: soilData.moisture,
      humidity: soilData.humidity,
      ph: soilData.ph,
      ec: soilData.ec,
    };

    setLiveHistory((prev) => {

      const updated = [...prev, newEntry];

      // Keep only last 10 readings
      if (updated.length > 10) {
        updated.shift();
      }

      return updated;
    });

  }, [soilData]);



  /* ===========================
     MONTHLY MOCK DATA
  =========================== */

  const monthlyData = [
    { month: "Jan", moisture: 45, ph: 6.5 },
    { month: "Feb", moisture: 48, ph: 6.7 },
    { month: "Mar", moisture: 42, ph: 6.8 },
    { month: "Apr", moisture: 50, ph: 7.0 },
    { month: "May", moisture: 47, ph: 6.9 },
    { month: "Jun", moisture: 52, ph: 7.1 },
  ];



  return (

    <div className="space-y-6">

      {/* ===========================
         EXISTING UI (UNCHANGED)
      =========================== */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* NPK Chart */}
        <div className="bg-white rounded-lg shadow p-6">

          <h3 className="mb-4 flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            NPK Levels
          </h3>

          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={parameters}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />

              <Bar
                dataKey="value"
                radius={[8, 8, 0, 0]}
              >
                {parameters.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.color}
                  />
                ))}
              </Bar>

            </BarChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-3 gap-4 mt-4">
            {parameters.map((param) => (

              <div
                key={param.name}
                className="text-center"
              >

                <div className="text-xs text-gray-500">

                  {param.name === "N" &&
                    "Nitrogen"}

                  {param.name === "P" &&
                    "Phosphorus"}

                  {param.name === "K" &&
                    "Potassium"}

                </div>

                <div
                  className={getStatusColor(
                    param.value,
                    param.optimal
                  )}
                >
                  {getStatusText(
                    param.value,
                    param.optimal
                  )}
                </div>

              </div>

            ))}
          </div>

        </div>



        {/* Soil Conditions */}
        <div className="bg-white rounded-lg shadow p-6">

          <h3 className="mb-4">
            Soil Conditions
          </h3>

          <div className="space-y-4">

            <div className="flex justify-between">
              <span>Soil Moisture</span>
              <span>
                {soilData.moisture}%
              </span>
            </div>

            <div className="flex justify-between">
              <span>Humidity</span>
              <span>
                {soilData.humidity}%
              </span>
            </div>

            <div className="flex justify-between">
              <span>pH Level</span>
              <span>
                {soilData.ph.toFixed(1)}
              </span>
            </div>

            <div className="flex justify-between">
              <span>EC</span>
              <span>
                {soilData.ec.toFixed(2)} dS/m
              </span>
            </div>

          </div>

        </div>

      </div>



      {/* ===========================
         NEW REAL-TIME GRAPH
      =========================== */}

      <div className="bg-white rounded-lg shadow p-6">

        <h3 className="mb-4 flex items-center gap-2">

          <Droplet className="w-5 h-5" />

          Live Sensor Updates (Real-time)

        </h3>

        <ResponsiveContainer width="100%" height={250}>

          <LineChart data={liveHistory}>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="time" />

            <YAxis />

            <Tooltip />

            <Legend />

            <Line
              type="monotone"
              dataKey="moisture"
              stroke="#3b82f6"
            />

            <Line
              type="monotone"
              dataKey="ph"
              stroke="#10b981"
            />

            <Line
              type="monotone"
              dataKey="ec"
              stroke="#f59e0b"
            />

          </LineChart>

        </ResponsiveContainer>

      </div>



      {/* ===========================
         MONTHLY SOIL TREND
      =========================== */}

      <div className="bg-white rounded-lg shadow p-6">

        <h3 className="mb-4 flex items-center gap-2">

          <Zap className="w-5 h-5" />

          Monthly Soil Data Analysis
          (Last 6 Months)

        </h3>

        <ResponsiveContainer width="100%" height={250}>

          <LineChart data={monthlyData}>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="month" />

            <YAxis />

            <Tooltip />

            <Legend />

            <Line
              type="monotone"
              dataKey="moisture"
              stroke="#3b82f6"
            />

            <Line
              type="monotone"
              dataKey="ph"
              stroke="#10b981"
            />

          </LineChart>

        </ResponsiveContainer>

      </div>



    </div>

  );
}