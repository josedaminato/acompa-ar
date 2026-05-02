import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabaseConfigured } from '../lib/supabase'
import { DisclaimerBanner } from './DisclaimerBanner'
import { PrivacyTrustNote } from './PrivacyTrustNote'

export function AuthPage() {
  const [params] = useSearchParams()
  const mode = params.get('mode') === 'register' ? 'register' : 'login'
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const title = useMemo(
    () => (mode === 'register' ? 'Crear cuenta' : 'Iniciar sesión'),
    [mode],
  )

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!supabaseConfigured) {
      setError('Falta configurar Supabase en .env (VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY).')
      return
    }
    setSubmitting(true)
    try {
      if (mode === 'register') {
        if (!name.trim()) {
          setError('Escribí tu nombre.')
          setSubmitting(false)
          return
        }
        const { error: err } = await signUp(email.trim(), password, name.trim())
        if (err) {
          setError(err.message)
          setSubmitting(false)
          return
        }
        navigate('/onboarding', { state: { name: name.trim() } })
      } else {
        const { error: err } = await signIn(email.trim(), password)
        if (err) {
          setError(err.message)
          setSubmitting(false)
          return
        }
        navigate('/dashboard', { replace: true })
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-dvh bg-cream px-4 py-10">
      <div className="mx-auto max-w-md">
        <Link
          to="/"
          className="mb-6 inline-block text-sm text-clay-dark no-underline hover:underline"
        >
          ← Volver
        </Link>
        <h1 className="mb-2 text-2xl font-medium text-ink">{title}</h1>
        <p className="mb-6 text-ink-muted">
          {mode === 'register'
            ? 'Necesitamos unos datos básicos. Después vas a poder cargar tus contactos de apoyo.'
            : 'Ingresá con el email que usaste al registrarte.'}
        </p>

        <PrivacyTrustNote variant="short" className="mb-6" />

        <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-ink">
                Nombre
              </label>
              <input
                id="name"
                name="name"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-border-soft bg-surface px-4 py-3 text-ink outline-none ring-clay-dark/30 focus:ring-2"
              />
            </div>
          )}
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-ink">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-border-soft bg-surface px-4 py-3 text-ink outline-none ring-clay-dark/30 focus:ring-2"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-ink">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-border-soft bg-surface px-4 py-3 text-ink outline-none ring-clay-dark/30 focus:ring-2"
            />
          </div>

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full min-h-12 cursor-pointer rounded-2xl bg-clay-dark px-4 py-3 font-medium text-white disabled:opacity-60"
          >
            {submitting ? 'Procesando…' : mode === 'register' ? 'Registrarme' : 'Entrar'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-muted">
          {mode === 'register' ? (
            <>
              ¿Ya tenés cuenta?{' '}
              <Link to="/auth?mode=login" className="text-clay-dark font-medium">
                Iniciar sesión
              </Link>
            </>
          ) : (
            <>
              ¿Primera vez acá?{' '}
              <Link to="/auth?mode=register" className="text-clay-dark font-medium">
                Crear cuenta
              </Link>
            </>
          )}
        </p>

        <div className="mt-8">
          <DisclaimerBanner />
        </div>
      </div>
    </div>
  )
}
