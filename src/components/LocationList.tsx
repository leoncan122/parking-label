import { useState } from 'react'
import type { ParkingLocation } from '../lib/supabase'
import { VEHICLE_LABELS } from '../lib/supabase'
import { MapPin, Trash2, Navigation } from 'lucide-react'

interface LocationListProps {
  locations: ParkingLocation[]
  onDelete: (id: string) => void
}

function getLabelInfo(value: string) {
  return VEHICLE_LABELS.find((l) => l.value === value) || VEHICLE_LABELS[VEHICLE_LABELS.length - 1]
}

export default function LocationList({ locations, onDelete }: LocationListProps) {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  if (locations.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-100 text-center">
        <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-slate-600">Sin ubicaciones guardadas</h3>
        <p className="text-slate-400 text-sm mt-1">Guarda tu primera ubicación arriba</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
        📋 Ubicaciones guardadas ({locations.length})
      </h2>
      {locations
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .map((location) => {
          const labelInfo = getLabelInfo(location.label)
          const date = new Date(location.created_at)

          return (
            <div
              key={location.id}
              className="bg-white rounded-xl p-4 shadow-md border border-slate-100 flex items-center justify-between group hover:shadow-lg transition"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-12 h-12 ${labelInfo.color} rounded-xl flex items-center justify-center text-white flex-shrink-0`}>
                  <MapPin className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800 truncate">{labelInfo.label}</p>
                  <p className="text-xs text-slate-500">
                    {date.toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                  title="Abrir en Google Maps"
                >
                  <Navigation className="w-5 h-5" />
                </a>
                {confirmDelete === location.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onDelete(location.id)}
                      className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs rounded-lg transition"
                    >
                      Sí
                    </button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs rounded-lg transition"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(location.id)}
                    className="p-2 text-red-400 hover:bg-red-50 rounded-lg hover:text-red-600 transition"
                    title="Eliminar"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          )
        })}
    </div>
  )
}
