import { useState } from 'react'
import { VEHICLE_LABELS } from '../lib/supabase'

interface VehicleLabelSelectorProps {
  onSelect: (label: string) => void
}

export default function VehicleLabelSelector({ onSelect }: VehicleLabelSelectorProps) {
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null)

  return (
    <div className="bg-white rounded-2xl p-4 shadow-xl border border-slate-100">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Tipo de vehículo</h2>
      <div className="grid grid-cols-2 gap-3">
        {VEHICLE_LABELS.map(({ value, label, color }) => (
          <button
            key={value}
            onClick={() => {
              setSelectedLabel(value)
              onSelect(value)
            }}
            className={`p-4 rounded-xl border-2 transition text-left ${
              selectedLabel === value
                ? 'border-blue-500 bg-blue-50'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50'
            }`}
          >
            <span className="text-2xl block mb-1">{label.split(' ')[0]}</span>
            <span className={`text-sm font-medium ${selectedLabel === value ? 'text-blue-700' : 'text-slate-700'}`}>
              {label.split(' ')[1]}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
