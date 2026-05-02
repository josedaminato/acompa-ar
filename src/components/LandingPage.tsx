import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { DisclaimerBanner } from './DisclaimerBanner'
import { PrivacyTrustNote } from './PrivacyTrustNote'

export function LandingPage() {
  const navigate = useNavigate()
  const { enterDemoMode } = useAuth()

  function goInternalPreview() {
    enterDemoMode()
    navigate('/dashboard')
  }

  return (
    <div className="min-h-dvh bg-cream px-4 py-10">
      <div className="mx-auto max-w-lg">
        <p className="mb-8 text-center text-xs uppercase tracking-widest text-sage">
          Apoyo en recuperación
        </p>
        <h1 className="mb-4 text-center text-3xl font-medium leading-tight tracking-tight text-ink sm:text-4xl">
          No tenés que atravesar los momentos difíciles solo.
        </h1>
        <p className="mb-8 text-center text-lg leading-relaxed text-ink-muted">
          Una herramienta de apoyo diario para registrar cómo estás, pedir ayuda y atravesar
          momentos de ansiedad, soledad o impulso.
        </p>

        <PrivacyTrustNote className="mb-8" />

        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/auth?mode=register"
            className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-clay-dark px-6 text-center font-medium text-white no-underline shadow-sm"
          >
            Crear cuenta
          </Link>
          <Link
            to="/auth?mode=login"
            className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-border-soft bg-surface px-6 text-center font-medium text-ink no-underline"
          >
            Iniciar sesión
          </Link>
        </div>

        <div className="mb-8 rounded-2xl border border-sage-light bg-surface/90 px-4 py-4">
          <p className="m-0 text-sm font-medium text-ink">Probar la app por dentro</p>
          <p className="mt-2 mb-3 text-sm leading-relaxed text-ink-muted">
            Entrá sin cuenta ni servidor: es una vista previa interna. Los datos quedan solo en
            este navegador (ideal para revisar pantallas con alguien de confianza).
          </p>
          <button
            type="button"
            onClick={goInternalPreview}
            className="w-full min-h-12 cursor-pointer rounded-2xl border-2 border-dashed border-sage bg-cream/80 px-4 py-3 text-center font-medium text-ink transition hover:bg-cream"
          >
            Entrar en vista previa interna
          </button>
        </div>

        <div className="mb-8 rounded-2xl border border-amber-200/80 bg-amber-50/90 px-4 py-4 text-sm leading-relaxed text-ink">
          <p className="m-0 font-medium text-amber-950/90">Importante</p>
          <p className="mt-2 mb-0 text-amber-950/80">
            Esta herramienta no reemplaza terapia profesional ni atención médica. Si estás
            en peligro inmediato, contactá a emergencias o a una persona de confianza.
          </p>
        </div>

        <DisclaimerBanner variant="emphasis" />
      </div>
    </div>
  )
}
