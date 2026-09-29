import { Farm } from "../types";
import { X } from "lucide-react";
import { useState } from "react";

interface FarmSelectorProps {
  farms: Farm[];
  selectedFarmId: string;
  onSelectFarm: (farmId: string) => void;
  onDeleteFarm?: (farmId: string) => void;
}

export function FarmSelector({ farms, selectedFarmId, onSelectFarm, onDeleteFarm }: FarmSelectorProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleDelete = (e: React.MouseEvent, farmId: string) => {
    e.stopPropagation();
    if (confirmDeleteId === farmId) {
      onDeleteFarm?.(farmId);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(farmId);
      // Auto-cancel after 3 seconds
      setTimeout(() => setConfirmDeleteId(null), 3000);
    }
  };

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {farms.map((farm) => (
        <div
          key={farm.id}
          className={`relative flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
            selectedFarmId === farm.id
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          <button
            onClick={() => onSelectFarm(farm.id)}
            className="flex-1"
          >
            {farm.name}
          </button>
          {onDeleteFarm && farms.length > 1 && (
            <button
              onClick={(e) => handleDelete(e, farm.id)}
              className={`p-1 rounded hover:bg-red-500 hover:text-white transition-colors ${
                confirmDeleteId === farm.id
                  ? 'bg-red-500 text-white'
                  : selectedFarmId === farm.id
                  ? 'text-white hover:text-white'
                  : 'text-gray-500'
              }`}
              title={confirmDeleteId === farm.id ? 'Click again to confirm' : 'Delete farm'}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}