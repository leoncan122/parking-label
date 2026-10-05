/**
 * Traducción de errores de Supabase Auth a mensajes en español.
 *
 * Módulo independiente y reutilizable: no importa nada de Supabase ni de React,
 * así que sirve para cualquier pantalla (login, registro, recuperar contraseña)
 * y es testeable de forma aislada.
 */

/** Error de red: el fetch no llegó al servidor (proyecto pausado, sin internet, CORS). */
const NETWORK_MESSAGE =
  'No se pudo conectar con el servidor. Revisa tu conexión a internet; si el problema persiste, el proyecto de Supabase puede estar pausado.'

/**
 * Mensajes crudos de WebKit/Chromium/Firefox cuando un fetch falla a nivel de red.
 * Safari dice "Load failed", Chrome "Failed to fetch", Firefox "NetworkError...".
 */
const NETWORK_PATTERNS = [
  'load failed',
  'failed to fetch',
  'networkerror',
  'network request failed',
  'err_network',
  'err_internet_disconnected',
]

/** Mapa de `error_code` de Supabase GoTrue a texto en español. */
const CODE_MESSAGES: Record<string, string> = {
  invalid_credentials:
    'Email o contraseña incorrectos. Si creaste la cuenta con Google, entra con el botón "Continuar con Google".',
  email_not_confirmed:
    'Tu email aún no está confirmado. Revisa tu bandeja de entrada y haz clic en el enlace de confirmación.',
  user_already_exists: 'Ya existe una cuenta con este email. Inicia sesión en vez de registrarte.',
  email_exists: 'Ya existe una cuenta con este email. Inicia sesión en vez de registrarte.',
  weak_password: 'La contraseña es demasiado débil. Usa al menos 6 caracteres.',
  over_request_rate_limit: 'Demasiados intentos seguidos. Espera unos minutos y vuelve a intentarlo.',
  over_email_send_rate_limit:
    'Se enviaron demasiados correos a esta dirección. Espera unos minutos antes de reintentar.',
  validation_failed: 'Revisa los datos introducidos: el email o la contraseña no tienen un formato válido.',
  user_not_found: 'No existe ninguna cuenta con este email.',
  signup_disabled: 'El registro de nuevas cuentas está desactivado en este momento.',
  provider_disabled: 'Este método de inicio de sesión no está habilitado.',
  same_password: 'La nueva contraseña debe ser distinta de la actual.',
}

/** Coincidencias por texto, para errores antiguos que no traen `error_code`. */
const MESSAGE_PATTERNS: [string, string][] = [
  ['invalid login credentials', CODE_MESSAGES.invalid_credentials],
  ['email not confirmed', CODE_MESSAGES.email_not_confirmed],
  ['user already registered', CODE_MESSAGES.user_already_exists],
  ['password should be at least', 'La contraseña debe tener al menos 6 caracteres.'],
  ['unable to validate email address', 'El email no tiene un formato válido.'],
  ['email rate limit exceeded', CODE_MESSAGES.over_email_send_rate_limit],
]

/** Extrae el `error_code`/`code` de un error de Supabase sin asumir su forma. */
function readCode(error: unknown): string {
  if (typeof error !== 'object' || error === null) return ''
  const bag = error as Record<string, unknown>
  const raw = bag.error_code ?? bag.code
  return typeof raw === 'string' ? raw.toLowerCase() : ''
}

/** Extrae el mensaje legible de un error de cualquier tipo. */
function readMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  if (typeof error === 'object' && error !== null) {
    const bag = error as Record<string, unknown>
    for (const key of ['message', 'msg', 'error_description', 'error']) {
      const value = bag[key]
      if (typeof value === 'string' && value) return value
    }
  }
  return ''
}

/** `true` si el error es un fallo de red (la petición nunca llegó al servidor). */
export function isNetworkError(error: unknown): boolean {
  const message = readMessage(error).toLowerCase()
  if (!message) return false
  if (error instanceof TypeError && message) return true
  return NETWORK_PATTERNS.some((pattern) => message.includes(pattern))
}

/**
 * Convierte cualquier error de Supabase Auth en un mensaje en español listo para mostrar.
 *
 * @param error   Error capturado (AuthError, Error, string u objeto desconocido).
 * @param fallback Mensaje a usar si el error no se reconoce.
 */
export function describeAuthError(
  error: unknown,
  fallback = 'No se pudo completar la operación. Inténtalo de nuevo.',
): string {
  if (!error) return fallback

  // 1. Fallo de red: el caso que producía el críptico "Load failed".
  if (isNetworkError(error)) return NETWORK_MESSAGE

  // 2. Código de error estructurado de Supabase (la vía fiable).
  const code = readCode(error)
  if (code && CODE_MESSAGES[code]) return CODE_MESSAGES[code]

  // 3. Coincidencia por texto para versiones antiguas de GoTrue.
  const message = readMessage(error)
  const haystack = message.toLowerCase()
  for (const [pattern, translation] of MESSAGE_PATTERNS) {
    if (haystack.includes(pattern)) return translation
  }

  // 4. Último recurso: el mensaje original, o el fallback si venía vacío.
  return message || fallback
}
