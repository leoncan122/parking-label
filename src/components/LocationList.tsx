import { useState } from 'react'
import type { ParkingLocation } from '../lib/supabase'
import { VEHICLE_LABELS } from '../lib/supabase'
import { MapPin, MoreVertical, Share2, Pencil, Trash2, ArrowUpRight } from 'lucide-react'

interface LocationListProps {
  locations: ParkingLocation[]
  onDelete: (id: string) => void
  onEdit: (id: string, newLabel: string) => void
  isSelectMode?: boolean
  selectedIds?: Set<string>
  onToggleSelect?: (id: string) => void
}

function getLabelInfo(value: string) {
  return VEHICLE_LABELS.find((l) => l.value === value) || VEHICLE_LABELS[VEHICLE_LABELS.length - 1]
}

interface DropdownState {
  locationId: string
  isOpen: boolean
}

export default function LocationList({
  locations,
  onDelete,
  onEdit,
  isSelectMode = false,
  selectedIds = new Set(),
  onToggleSelect
}: LocationListProps) {
  const [dropdown, setDropdown] = useState<DropdownState>({ locationId: '', isOpen: false })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const openDropdown = (locationId: string) => {
    setDropdown({ locationId, isOpen: true })
  }

  const closeDropdown = () => {
    setDropdown({ locationId: '', isOpen: false })
  }

  const handleShare = (location: ParkingLocation) => {
    const url = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`
    navigator.clipboard.writeText(url).then(() => {})
    closeDropdown()
  }

  const handleEdit = (location: ParkingLocation) => {
    setEditingId(location.id)
    setEditValue(location.label)
    closeDropdown()
  }

  const saveEdit = () => {
    if (editingId && editValue.trim()) {
      onEdit(editingId, editValue.trim())
      setEditingId(null)
      setEditValue('')
    }
  }

  const handleDelete = (id: string) => {
    closeDropdown()
    onDelete(id)
  }

  return (
    <div className="space-y-2">
      {/* Edit modal */}
      {editingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => { setEditingId(null); setEditValue(''); }}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-slate-800 mb-4">Editar nombre</h3>
            <input
              type="text"
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              placeholder="Nuevo nombre"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => { setEditingId(null); setEditValue(''); }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium py-3 rounded-xl transition"
              >
                Cancelar
              </button>
              <button
                onClick={saveEdit}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Location cards */}
      {locations
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .map((location) => {
          const labelInfo = getLabelInfo(location.label)
          const date = new Date(location.created_at)
          const isSelected = selectedIds.has(location.id)
          const activeDropdown = dropdown.locationId === location.id && dropdown.isOpen

          return (
            <div
              key={location.id}
              className={`rounded-xl p-3.5 shadow-sm border transition-all relative ${
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

                {/* Actions - Google Maps button + Dropdown menu */}
                {!isSelectMode && (
                  <div className="flex items-center gap-1">
                    {/* Google Maps button */}
                    <a
                      href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                      title="Abrir en Google Maps"
                    >
                      <ArrowUpRight className="w-5 h-5" />
                    </a>

                    <div className="relative">
                      {activeDropdown && (
                        <div className="absolute right-0 top-10 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-20 min-w-[160px]">
                          <button
                            onClick={() => handleShare(location)}
                            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition"
                          >
                            <Share2 className="w-4 h-4 text-blue-500" />
                            Compartir
                          </button>
                          <button
                            onClick={() => handleEdit(location)}
                            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition"
                          >
                            <Pencil className="w-4 h-4 text-amber-500" />
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(location.id)}
                            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                            Eliminar
                          </button>
                        </div>
                      )}

                      <button
                        onClick={() => activeDropdown ? closeDropdown() : openDropdown(location.id)}
                        className="p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 rounded-lg transition"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
    </div>
  )
}
