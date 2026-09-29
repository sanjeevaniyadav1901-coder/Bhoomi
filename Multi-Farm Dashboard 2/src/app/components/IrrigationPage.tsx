import { IrrigationMode, IrrigationStatus, MLRecommendation } from "../types";
import { IrrigationControl } from "./IrrigationControl";
import { MLRecommendations } from "./MLRecommendations";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Droplets, Clock } from "lucide-react";
import { useState, useEffect } from "react";

interface IrrigationPageProps {
  mode?: IrrigationMode;
  status?: IrrigationStatus;
  recommendations?: MLRecommendation[];
  onModeChange?: (mode: IrrigationMode) => void;
  onToggleIrrigation?: () => void;
}

export function IrrigationPage({
  mode = "smart",
  status,
  recommendations = [],
  onModeChange = () => {},
  onToggleIrrigation = () => {},
}: IrrigationPageProps) {
  
  /* ================= SAFE STATUS (IMPORTANT) ================= */
  const safeStatus: IrrigationStatus = status || {
    active: false,
    flowRate: 0,
    duration: 0,
    lastIrrigated: new Date().toISOString(),
  };

  const [irrigationHistory, setIrrigationHistory] = useState<any[]>([]);

  useEffect(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date().getDay();

    const data = [];

    for (let i = 6; i >= 0; i--) {
      const dayIndex = (today - i + 7) % 7;
      data.push({
        day: days[dayIndex],
        duration: Math.floor(Math.random() * 120) + 60,
        waterUsed: Math.floor(Math.random() * 500) + 300,
      });
    }

    setIrrigationHistory(data);
  }, []);

  /* ================= SAFE FILTER ================= */
  const irrigationRecommendations = (recommendations || []).filter((rec) =>
    rec?.title?.toLowerCase?.().includes("irrigation") ||
    rec?.title?.toLowerCase?.().includes("water") ||
    rec?.title?.toLowerCase?.().includes("rain")
  );

  return (
    <div className="space-y-6">

      {/* CONTROL */}
      <IrrigationControl
        mode={mode}
        status={safeStatus}
        onModeChange={onModeChange}
        onToggleIrrigation={onToggleIrrigation}
      />

      {/* ML */}
      {irrigationRecommendations.length > 0 && (
        <MLRecommendations recommendations={irrigationRecommendations} />
      )}

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <Droplets className="text-blue-600" />
            <div>
              <div className="text-2xl">{safeStatus.flowRate}</div>
              <div className="text-sm text-gray-600">Flow Rate (L/min)</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <Clock className="text-green-600" />
            <div>
              <div className="text-2xl">{safeStatus.duration}</div>
              <div className="text-sm text-gray-600">Minutes Today</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <Droplets className="text-purple-600" />
            <div>
              <div className="text-2xl">
                {(safeStatus.flowRate * safeStatus.duration).toFixed(0)}
              </div>
              <div className="text-sm text-gray-600">Liters Used</div>
            </div>
          </div>
        </div>

      </div>

      {/* GRAPH */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3>Weekly Irrigation History</h3>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={irrigationHistory}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />

            <Line type="monotone" dataKey="duration" stroke="#3b82f6" />
            <Line type="monotone" dataKey="waterUsed" stroke="#10b981" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* MODE INFO */}
      <div className="bg-white rounded-lg shadow p-6">

        {mode === "smart" ? (
          <div className="text-center text-gray-500">
            Smart AI irrigation active
          </div>
        ) : mode === "scheduled" ? (
          <div className="text-center text-gray-500">
            Scheduled irrigation mode
          </div>
        ) : (
          <div className="text-center text-gray-500">
            Manual irrigation mode
          </div>
        )}

      </div>

    </div>
  );
}