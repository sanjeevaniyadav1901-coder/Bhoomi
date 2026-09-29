import { Zone } from "../types"; // ✅ FIXED (important)
import { Droplet } from "lucide-react";

interface ZoneClassificationProps {
  zones: Zone[];
}

export function ZoneClassification({ zones = [] }: ZoneClassificationProps) {

  const getZoneColor = (status: "dry" | "medium" | "wet") => {
    switch (status) {
      case "dry":
        return "bg-red-100 border-red-300 text-red-800";
      case "medium":
        return "bg-yellow-100 border-yellow-300 text-yellow-800";
      case "wet":
        return "bg-green-100 border-green-300 text-green-800";
    }
  };

  const getZoneIcon = (status: "dry" | "medium" | "wet") => {
    switch (status) {
      case "dry":
        return <Droplet className="w-4 h-4" />;
      case "medium":
        return (
          <Droplet className="w-4 h-4 fill-current" style={{ opacity: 0.5 }} />
        );
      case "wet":
        return <Droplet className="w-4 h-4 fill-current" />;
    }
  };

  const dryZones = zones.filter((z) => z.status === "dry");
  const mediumZones = zones.filter((z) => z.status === "medium");
  const wetZones = zones.filter((z) => z.status === "wet");

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="mb-4">Zone Classification</h3>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="text-2xl text-red-600">{dryZones.length}</div>
          <div className="text-xs text-gray-600">Dry Zones</div>
        </div>

        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <div className="text-2xl text-yellow-600">{mediumZones.length}</div>
          <div className="text-xs text-gray-600">Medium</div>
        </div>

        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl text-green-600">{wetZones.length}</div>
          <div className="text-xs text-gray-600">Wet Zones</div>
        </div>
      </div>

      {/* Zone Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {zones.map((zone) => (
          <div
            key={zone.id}
            className={`p-3 rounded-lg border-2 ${getZoneColor(zone.status)}`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs">{zone.name}</span>
              {getZoneIcon(zone.status)}
            </div>
            <div className="text-sm">{zone.moisture}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}