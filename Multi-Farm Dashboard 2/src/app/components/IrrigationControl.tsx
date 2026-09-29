import { useState } from 'react';
import { IrrigationMode, IrrigationStatus } from '../types';
import { Droplets, Cpu, Calendar, Hand, Play, Pause } from 'lucide-react';

interface IrrigationControlProps {
  mode: IrrigationMode;
  status: IrrigationStatus;
  onModeChange: (mode: IrrigationMode) => void;
  onToggleIrrigation: () => void;
}

export function IrrigationControl({ mode, status, onModeChange, onToggleIrrigation }: IrrigationControlProps) {
  const modes: { id: IrrigationMode; label: string; icon: any; description: string }[] = [
    { id: 'smart', label: 'Smart Mode', icon: Cpu, description: 'AI/ML + Weather based decisions' },
    { id: 'manual', label: 'Manual', icon: Hand, description: 'User controlled irrigation' },
    { id: 'scheduled', label: 'Scheduled', icon: Calendar, description: 'Time-based irrigation' },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="flex items-center gap-2">
          <Droplets className="w-5 h-5" />
          Irrigation Control
        </h3>
        <div className={`px-3 py-1 rounded-full text-sm ${
          status.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
        }`}>
          {status.active ? '● Active' : '○ Inactive'}
        </div>
      </div>

      {/* Mode Selection */}
      <div className="mb-6">
        <label className="text-sm text-gray-600 mb-2 block">Irrigation Mode</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {modes.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                onClick={() => onModeChange(m.id)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  mode === m.id
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-5 h-5" />
                  <span>{m.label}</span>
                </div>
                <div className="text-xs text-gray-600">{m.description}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Status Info */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-600">Flow Rate</div>
          <div className="text-xl">{status.flowRate} L/min</div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-600">Duration Today</div>
          <div className="text-xl">{status.duration} min</div>
        </div>
      </div>

      {/* Control Button */}
      <button
        onClick={onToggleIrrigation}
        disabled={mode === 'smart'}
        className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
          mode === 'smart'
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : status.active
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-green-600 hover:bg-green-700 text-white'
        }`}
      >
        {status.active ? (
          <>
            <Pause className="w-5 h-5" />
            Stop Irrigation
          </>
        ) : (
          <>
            <Play className="w-5 h-5" />
            Start Irrigation
          </>
        )}
      </button>

      {mode === 'smart' && (
        <div className="mt-2 text-xs text-gray-600 text-center">
          In Smart Mode, irrigation is controlled automatically
        </div>
      )}
    </div>
  );
}
