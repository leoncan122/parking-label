import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const useRuntimeCheck = typeof process !== 'undefined' && process.env.NODE_ENV === 'development'

if (useRuntimeCheck && (!supabaseUrl || !supabaseAnonKey)) {
  throw new Error('Faltan variables de entorno: VITE_SUPABISE_URL y VITE_SUPABISE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type ParkingLocation = {
  id: string
  user_id: string
  latitude: number
  longitude: number
  label: string
  created_at: string
  updated_at: string
}

export const VEHICLE_LABELS = [
  { value: 'moto', label: '🏍️ Moto', color: 'bg-red-500' },
  { value: 'auto', label: '🚗 Auto', color: 'bg-blue-500' },
  { value: 'bicicleta', label: '🚲 Bicicleta', color: 'bg-green-500' },
  { value: 'scooter', label: '🛴 Scooter', color: 'bg-yellow-500' },
  { value: 'otro', label: '🚙 Otro', color: 'bg-purple-500' },
] as const
