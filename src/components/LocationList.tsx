import { useState } from 'react'
import type { ParkingLocation } from '../lib/supabase'
import { VEHICLE_LABELS } from '../lib/supabase'
import { MapPin, Trash2, Navigation } from 'lucide-react'

interface LocationListProps {
  locations: ParkingLocation[]
  onDelete: (id: string) => void
  onDeleteAll?: () => void
}

function getLabelInfo(value: string) {
  return VEHICLE_LABELS.find((l) => l.value === value) || VEHICLE_LABELS[VEHICLE_LABELS.length - 1]
}

export default function LocationList({ locations, onDelete, onDeleteAll }: LocationListProps) {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  if (locations.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      {/* Delete all button */}
      {locations.length >= 2 && onDeleteAll && (
        <button
          onClick={() => {
            if (window.confirm('¿Eliminar TODAS las ubicaciones? Esta acción no se puede deshacer.')) {
              onDeleteAll()
            }
          }}
          className="flex items-center gap-1.5 w-full text-xs text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg p-2 transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Eliminar todo
        </button>
      )}

      {/* Location cards */}
      {locations
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .map((location) => {
          const labelInfo = getLabelInfo(location.label)
          const date = new Date(location.created_at)

          return (
            <div
              key={location.id}
              className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-100 flex items-center gap-3"
            >
              {/* Icon */}
              <div className={`w-10 h-10 ${labelInfo.color} rounded-lg flex items-center justify-center text-white flex-shrink-0`}>
                <MapPin className="w-5 h-5" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 text-sm">{labelInfo.label}</p>
                <p className="text-xs text-slate-400">
                  {date.toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <a
                  href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                  title="Abrir en Google Maps"
                >
                  <Navigation className="w-4.5 h-4.5" />
                </a>

                {confirmDelete === location.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onDelete(location.id)}
                      className="px-2.5 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs rounded-lg transition font-medium"
                    >
                      Sí
                    </button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs rounded-lg transition font-medium"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(location.id)}
                    className="p-2 text-red-300 hover:bg-red-50 hover:text-red-500 rounded-lg transition"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                )}
              </div>
            </div>
          )
        })}
    </div>
  )
}