import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://potehernjpuqwzdmtdwz.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

const useRuntimeCheck = typeof import.meta !== 'undefined' && import.meta.env?.DEV

if (useRuntimeCheck && !supabaseAnonKey) {
  console.warn('⚠️ VITE_SUPABASE_ANON_KEY no configurada. Algunas funciones pueden fallar.')
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
