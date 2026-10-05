import { createClient } from '@supabase/supabase-js'

/**
 * Sin valores por defecto a propósito: una URL hardcodeada hace que la app
 * apunte en silencio a un proyecto viejo en vez de fallar de forma visible.
 */
function requireEnv(name: 'VITE_SUPABASE_URL' | 'VITE_SUPABASE_ANON_KEY'): string {
  const value = import.meta.env[name]
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(
      `[config] Falta la variable de entorno ${name}. ` +
        'Añádela a tu archivo .env (ver .env.example) y reinicia el servidor de desarrollo.',
    )
  }
  return value.trim()
}

const supabaseUrl = requireEnv('VITE_SUPABASE_URL')
const supabaseAnonKey = requireEnv('VITE_SUPABASE_ANON_KEY')

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
