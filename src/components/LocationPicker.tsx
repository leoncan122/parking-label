import { useState, useCallback } from 'react'
import { MapPin, LocateFixed } from 'lucide-react'

interface LocationPickerProps {
  onLocationSelected: (lat: number, lng: number) => void
}

export default function LocationPicker({ onLocationSelected }: LocationPickerProps) {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null)
  const [mapPosition, setMapPosition] = useState<{ lat: number; lng: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mapMode, setMapMode] = useState(false)
  const [mapBounds, setMapBounds] = useState({ lat: 40.4168, lng: -3.7038, zoom: 13 })

  const handleGetCurrentLocation = useCallback(() => {
    setLoading(true)
    setError('')

    if (!navigator.geolocation) {
      setError('Geolocalización no soportada en este navegador')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const location = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }
        setPosition(location)
        setMapPosition(location)
        setMapBounds((prev) => ({ ...prev, lat: location.lat, lng: location.lng }))
        setLoading(false)
      },
      (err) => {
        setError(err.message || 'Error al obtener ubicación')
        setLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [])

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapPosition) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    const lat = mapBounds.lat + (y - 0.5) * 0.02 * (1 / Math.cos((mapBounds.lat * Math.PI) / 180))
    const lng = mapBounds.lng + (x - 0.5) * 0.02
    setMapPosition({ lat, lng })
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-xl border border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-500" />
          Ubicación
        </h2>
        <button
          onClick={() => setMapMode(!mapMode)}
          className="text-sm bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition"
        >
          {mapMode ? '📍 Ubicación actual' : '🗺️ Ver mapa'}
        </button>
      </div>

      {!mapMode ? (
        <>
          <button
            onClick={handleGetCurrentLocation}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 rounded-xl transition flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <LocateFixed className="w-5 h-5" />
            {loading ? 'Obteniendo ubicación...' : 'Usar mi ubicación actual'}
          </button>

          {error && (
            <div className="mt-3 text-red-500 text-sm bg-red-50 border border-red-100 rounded-lg p-3">
              {error}
            </div>
          )}

          {position && (
            <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg p-3">
              <p className="text-sm text-blue-800 font-medium">Ubicación detectada:</p>
              <p className="text-xs text-blue-600 mt-1">
                Lat: {position.lat.toFixed(6)} | Lng: {position.lng.toFixed(6)}
              </p>
              <button
                onClick={() => onLocationSelected(position.lat, position.lng)}
                className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition"
              >
                Confirmar esta ubicación
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="relative">
          <div
            onClick={handleMapClick}
            className="w-full h-64 bg-slate-100 rounded-xl cursor-crosshair flex items-center justify-center relative overflow-hidden border border-slate-200"
            style={{
              backgroundImage: 'url(https://tile.openstreetmap.org/13/2689/3520.png)',
              backgroundSize: 'cover',
            }}
          >
            <p className="absolute bottom-2 left-2 text-xs bg-white/90 px-2 py-1 rounded text-slate-600">
              Toca el mapa para seleccionar
            </p>
            {mapPosition && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full">
                <MapPin className="w-8 h-8 text-red-500 drop-shadow-lg" />
              </div>
            )}
          </div>
          {mapPosition && (
            <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg p-3">
              <p className="text-sm text-blue-800 font-medium">Ubicación seleccionada:</p>
              <p className="text-xs text-blue-600 mt-1">
                Lat: {mapPosition.lat.toFixed(6)} | Lng: {mapPosition.lng.toFixed(6)}
              </p>
              <button
                onClick={() => onLocationSelected(mapPosition.lat, mapPosition.lng)}
                className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition"
              >
                Confirmar esta ubicación
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
