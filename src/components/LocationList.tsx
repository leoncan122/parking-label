import { useState } from 'react'
import type { ParkingLocation } from '../lib/supabase'
import { VEHICLE_LABELS } from '../lib/supabase'
import { MapPin, Trash2, Navigation } from 'lucide-react'

interface LocationListProps {
  locations: ParkingLocation[]
  onDelete: (id: string) => void
  onDeleteAll?: () => void
  isSelectMode?: boolean
  selectedIds?: Set<string>
  onToggleSelect?: (id: string) => void
}

function getLabelInfo(value: string) {
  return VEHICLE_LABELS.find((l) => l.value === value) || VEHICLE_LABELS[VEHICLE_LABELS.length - 1]
}

export default function LocationList({ 
  locations, 
  onDelete, 
  onDeleteAll, 
  isSelectMode = false,
  selectedIds = new Set(),
  onToggleSelect 
}: LocationListProps) {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  if (locations.length === 0) return null

  return (
    <div className="space-y-2">
      {/* Bulk delete button — only when items selected */}
      {isSelectMode && selectedIds.size > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center justify-between">
          <span className="text-sm font-medium text-red-700">
            {selectedIds.size} seleccionada{selectedIds.size > 1 ? 's' : ''}
          </span>
          <button
            onClick={() => {
              if (confirm(`¿Eliminar ${selectedIds.size} ubicación${selectedIds.size > 1 ? 'es' : ''}?`)) {
                onDeleteAll?.()
              }
            }}
            className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-3 py-2 rounded-lg transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Eliminar seleccionadas
          </button>
        </div>
      )}

      {/* Location cards */}
      {locations
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .map((location) => {
          const labelInfo = getLabelInfo(location.label)
          const date = new Date(location.created_at)
          const isSelected = selectedIds.has(location.id)

          return (
            <div
              key={location.id}
              className={`rounded-xl p-3.5 shadow-sm border transition-all ${
                isSelectMode
                  ? isSelected
                    ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-200'
                    : 'border-slate-200 bg-white'
                  : 'border-slate-100 bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Selection checkbox or icon */}
                {isSelectMode ? (
                  <button
                    onClick={() => onToggleSelect?.(location.id)}
                    className="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all"
                    style={{
                      borderColor: isSelected ? '#3b82f6' : '#cbd5e1',
                      backgroundColor: isSelected ? '#3b82f6' : 'transparent',
                    }}
                  >
                    {isSelected && (
                      <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                ) : (
                  <div className={`w-10 h-10 ${labelInfo.color} rounded-lg flex items-center justify-center text-white flex-shrink-0`}>
                    <MapPin className="w-5 h-5" />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm ${isSelectMode ? 'text-slate-800' : 'text-slate-800'}`}>
                    {labelInfo.label}
                  </p>
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
                {!isSelectMode && (
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
                )}
              </div>
            </div>
          )
        })}
    </div>
  )
}
