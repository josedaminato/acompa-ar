import { createClient } from '@supabase/supabase-js'

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim()
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim()

export const supabaseConfigured = Boolean(url && anonKey)

if (!supabaseConfigured) {
  console.warn(
    'Supabase: faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY. Podés ver la interfaz, pero registro e historial no funcionarán hasta crear un archivo .env.',
  )
}

/**
 * Sin .env el SDK no admite URL vacía (lanza error). Usamos placeholders válidos solo para
 * montar la app en desarrollo; las llamadas a la API fallarán hasta configurar el proyecto.
 */
const resolvedUrl = url ?? 'https://preview-disabled.supabase.co'
const resolvedKey =
  anonKey ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlLXByZXZpZXctZGlzYWJsZWQifQ.preview-disabled'

export const supabase = createClient(resolvedUrl, resolvedKey, {
  auth: {
    persistSession: Boolean(supabaseConfigured),
    autoRefreshToken: Boolean(supabaseConfigured),
    detectSessionInUrl: Boolean(supabaseConfigured),
  },
})
