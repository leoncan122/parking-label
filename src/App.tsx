import { useState } from 'react'
import { supabase } from './lib/supabase'
import type { ParkingLocation } from './lib/supabase'
import AuthScreen from './components/AuthScreen'
import LocationPicker from './components/LocationPicker'
import VehicleLabelSelector from './components/VehicleLabelSelector'
import LocationList from './components/LocationList'

export default function App() {
  const [user, setUser] = useState<any>(null)
  const [locations, setLocations] = useState<ParkingLocation[]>([])
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [selectedLabel, setSelectedLabel] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const checkSession = async () => {
    const { data } = await supabase.auth.getSession()
    if (data.session) {
      setUser(data.session.user)
      fetchLocations(data.session.user.id)
    }
  }

  const fetchLocations = async (userId: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('parking_locations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setLocations(data || [])
    } catch (err) {
      console.error('Error fetching locations:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveLocation = async () => {
    if (!selectedLocation || !selectedLabel || !user) return

    setSaving(true)
    try {
      const { error } = await supabase.from('parking_locations').insert({
        user_id: user.id,
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
        label: selectedLabel,
      })

      if (error) throw error

      await fetchLocations(user.id)
      setSelectedLocation(null)
      setSelectedLabel('')
    } catch (err) {
      console.error('Error saving location:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('parking_locations').delete().eq('id', id)
      if (error) throw error

      if (user) await fetchLocations(user.id)
    } catch (err) {
      console.error('Error deleting location:', err)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setLocations([])
  }

  if (!user) {
    return <AuthScreen onLogin={() => checkSession()} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-8">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🅿️</span>
            <h1 className="text-xl font-bold text-slate-800">ParkIt</h1>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-slate-500 hover:text-red-500 transition flex items-center gap-1"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-6 space-y-6">
        <LocationPicker
          onLocationSelected={(lat, lng) => setSelectedLocation({ lat, lng })}
        />

        <VehicleLabelSelector onSelect={setSelectedLabel} />

        {selectedLocation && selectedLabel && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-800 font-medium mb-2">
              Resumen:
            </p>
            <div className="flex items-center justify-between">
              <span className="text-blue-700">
                🏷️ {selectedLabel} — 📍 ({selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)})
              </span>
              <button
                onClick={handleSaveLocation}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Guardar ubicación'}
              </button>
            </div>
          </div>
        )}

        <LocationList
          locations={locations}
          onDelete={handleDelete}
        />
      </main>
    </div>
  )
}
