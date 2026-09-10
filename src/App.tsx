import { useState } from 'react'
import { supabase } from './lib/supabase'
import type { ParkingLocation } from './lib/supabase'
import AuthScreen from './components/AuthScreen'
import LocationList from './components/LocationList'
import AddLocationWizard from './components/AddLocationWizard'
import { MapPin, Plus } from 'lucide-react'

export default function App() {
  const [user, setUser] = useState<any>(null)
  const [locations, setLocations] = useState<ParkingLocation[]>([])
  const [wizardOpen, setWizardOpen] = useState(false)

  const checkSession = async () => {
    const { data } = await supabase.auth.getSession()
    if (data.session) {
      setUser(data.session.user)
      fetchLocations(data.session.user.id)
    }
  }

  const fetchLocations = async (userId: string) => {
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
    }
  }

  const handleSaveLocation = async (lat: number, lng: number, label: string) => {
    if (!user) return

    try {
      const { error } = await supabase.from('parking_locations').insert({
        user_id: user.id,
        latitude: lat,
        longitude: lng,
        label: label,
      })

      if (error) throw error

      await fetchLocations(user.id)
    } catch (err) {
      console.error('Error saving location:', err)
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

  const handleDeleteAll = async () => {
    if (!user || locations.length === 0) return

    try {
      const { error } = await supabase
        .from('parking_locations')
        .delete()
        .eq('user_id', user.id)

      if (error) throw error
      setLocations([])
    } catch (err) {
      console.error('Error deleting all locations:', err)
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
        {/* Empty state or locations */}
        {locations.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-100 text-center">
            <MapPin className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-600">Sin ubicaciones guardadas</h3>
            <p className="text-slate-400 text-sm mt-2 mb-6">
              Agrega tu primera ubicación para recordar dónde estacionaste tu vehículo
            </p>
            <button
              onClick={() => setWizardOpen(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-8 py-4 rounded-xl transition shadow-lg shadow-blue-200"
            >
              <Plus className="w-5 h-5" />
              Agregar vehículo
            </button>
          </div>
        ) : (
          <LocationList locations={locations} onDelete={handleDelete} onDeleteAll={handleDeleteAll} />
        )}
      </main>

      {/* Wizard Modal */}
      {wizardOpen && (
        <AddLocationWizard
          onClose={() => setWizardOpen(false)}
          onSave={handleSaveLocation}
        />
      )}
    </div>
  )
}
