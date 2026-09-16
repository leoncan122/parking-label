import { useEffect, useRef, useState, useCallback } from 'react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { LocateFixed } from 'lucide-react'

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

interface LocationPickerProps {
  onLocationSelected: (lat: number, lng: number) => void
}

export default function LocationPicker({ onLocationSelected }: LocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null)

  const initMap = useCallback(() => {
    if (!mapContainerRef.current || mapRef.current) return

    mapRef.current = L.map(mapContainerRef.current).setView([40.4168, -3.7038], 13)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(mapRef.current)

    mapRef.current.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng
      setSelectedLocation({ lat, lng })

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng])
      } else {
        markerRef.current = L.marker([lat, lng]).addTo(mapRef.current!)
      }
    })
  }, [])

  // Initialize map
  useEffect(() => {
    initMap()
    return () => {
      mapRef.current?.remove()
      mapRef.current = null
      markerRef.current = null
    }
  }, [initMap])

  // Try to get user location
  const handleGetCurrentLocation = useCallback(() => {
    setLoading(true)
    setError('')

    if (!navigator.geolocation) {
      setError('Geolocalización no soportada')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setSelectedLocation({ lat, lng })

        if (mapRef.current) {
          mapRef.current.setView([lat, lng], 16)
        }

        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng])
        } else {
          markerRef.current = L.marker([lat, lng]).addTo(mapRef.current!)
        }
        setLoading(false)
      },
      (err) => {
        setError(err.message || 'Error al obtener ubicación')
        setLoading(false)
      },
      { enableHighAccuracy: true, timeout: 15000 }
    )
  }, [])

  // Auto-detect location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude
          const lng = pos.coords.longitude
          setSelectedLocation({ lat, lng })
          if (mapRef.current) {
            mapRef.current.setView([lat, lng], 16)
          }
          if (!markerRef.current) {
            markerRef.current = L.marker([lat, lng]).addTo(mapRef.current!)
          }
        },
        () => {},
        { enableHighAccuracy: true }
      )
    }
  }, [])

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">
        Toca el mapa o usa tu ubicación actual
      </p>

      <div
        ref={mapContainerRef}
        className="w-full h-72 rounded-xl border border-slate-200 overflow-hidden"
      />

      <button
        onClick={handleGetCurrentLocation}
        disabled={loading}
        className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
      >
        <LocateFixed className="w-4 h-4" />
        {loading ? 'Obteniendo...' : 'Usar mi ubicación actual'}
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
          {error}
        </div>
      )}

      {selectedLocation && (
        <button
          onClick={() => onLocationSelected(selectedLocation.lat, selectedLocation.lng)}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition text-sm"
        >
          ✓ Confirmar ubicación
        </button>
      )}
    </div>
  )
}
