import { useState } from 'react'
import { supabase } from './lib/supabase'
import type { ParkingLocation } from './lib/supabase'
import AuthScreen from './components/AuthScreen'
import LocationList from './components/LocationList'
import AddLocationWizard from './components/AddLocationWizard'
import { MapPin, Plus, LogOut, Trash2 } from 'lucide-react'

export default function App() {
  const [user, setUser] = useState<any>(null)
  const [locations, setLocations] = useState<ParkingLocation[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [wizardOpen, setWizardOpen] = useState(false)
  const [isSelectMode, setIsSelectMode] = useState(false)

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

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return
    if (!confirm(`¿Eliminar ${selectedIds.size} ubicación${selectedIds.size > 1 ? 'es' : ''}?`)) return

    try {
      const { error } = await supabase
        .from('parking_locations')
        .delete()
        .in('id', Array.from(selectedIds))

      if (error) throw error
      setLocations(prev => prev.filter(l => !selectedIds.has(l.id)))
      setSelectedIds(new Set())
    } catch (err) {
      console.error('Error deleting selected locations:', err)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('parking_locations').delete().eq('id', id)
      if (error) throw error

      if (user) await fetchLocations(user.id)
      setSelectedIds(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
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
      setSelectedIds(new Set())
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
    <div className="min-h-screen bg-slate-50 pb-8">
      {/* Header */}
      <header className="bg-white sticky top-0 z-10 shadow-sm border-b border-slate-100">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">P</span>
            </div>
            <h1 className="text-lg font-bold text-slate-800">ParkIt</h1>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs text-slate-400 hover:text-red-500 transition flex items-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4">
        {/* Empty state */}
        {locations.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center mt-4">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-base font-semibold text-slate-700 mb-1">Sin ubicaciones</h3>
            <p className="text-slate-400 text-sm mb-6">
              Agrega dónde estacionaste tu vehículo
            </p>
            <button
              onClick={() => setWizardOpen(true)}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-xl transition text-sm"
            >
              <Plus className="w-4 h-4" />
              Agregar vehículo
            </button>
          </div>
        ) : (
          <>
            {/* Header for list view */}
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-slate-700">
                {isSelectMode && selectedIds.size > 0
                  ? `${selectedIds.size} seleccionada${selectedIds.size !== 1 ? 's' : ''}`
                  : 'Tus ubicaciones'}
              </h2>
              <div className="flex items-center gap-2">
                {isSelectMode ? (
                  <>
                    {selectedIds.size > 0 && (
                      <button
                        onClick={handleDeleteSelected}
                        className="inline-flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-3 py-2 rounded-lg transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Eliminar ({selectedIds.size})
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setIsSelectMode(false)
                        setSelectedIds(new Set())
                      }}
                      className="inline-flex items-center gap-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-medium px-3 py-2 rounded-lg transition"
                    >
                      Listo
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsSelectMode(true)}
                      className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium px-3 py-2 rounded-lg transition"
                    >
                      Seleccionar
                    </button>
                    <button
                      onClick={() => setWizardOpen(true)}
                      className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-2 rounded-lg transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Agregar
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Location list */}
            <LocationList 
              locations={locations} 
              onDelete={handleDelete} 
              onDeleteAll={handleDeleteAll}
              isSelectMode={isSelectMode}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
            />
          </>
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