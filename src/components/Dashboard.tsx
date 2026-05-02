import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useProfile } from '../hooks/useProfile'
import { supabaseConfigured } from '../lib/supabase'
import type { Mood, SituationContext } from '../types/database'
import { ContextSelector } from './ContextSelector'
import { DisclaimerBanner, CrisisLine } from './DisclaimerBanner'
import { MoodSelector } from './MoodSelector'
import { ReflectionForm } from './ReflectionForm'
import { RelapseForm } from './RelapseForm'
import { SupportMode } from './SupportMode'

type Step =
  | { phase: 'mood' }
  | { phase: 'context'; mood: Mood }
  | { phase: 'reflection'; mood: Mood; context: SituationContext }
  | { phase: 'support'; mood: Mood; context: SituationContext }
  | { phase: 'relapse'; context: SituationContext }

function flowFor(mood: Mood, context: SituationContext): 'reflection' | 'support' | 'relapse' {
  if (mood === 'consumed') return 'relapse'
  if (mood === 'anxious' || mood === 'craving' || mood === 'others_using') return 'support'
  if (mood === 'tranquil') return 'reflection'
  const calm: SituationContext[] = ['alone', 'good_company', 'home']
  if (calm.includes(context)) return 'reflection'
  return 'support'
}

export function Dashboard() {
  const { user } = useAuth()
  const { profile, supportContacts, loading, error, refresh } = useProfile()
  const [step, setStep] = useState<Step>({ phase: 'mood' })

  const crisisMessage = useMemo(
    () =>
      profile?.crisis_message?.trim() ||
      'Estoy pasando un momento difícil y necesito hablar con alguien. ¿Podés responderme?',
    [profile?.crisis_message],
  )

  const reset = useCallback(() => {
    setStep({ phase: 'mood' })
  }, [])

  if (!user) return null

  if (!supabaseConfigured) {
    return (
      <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
        Configurá <code className="text-xs">VITE_SUPABASE_URL</code> y{' '}
        <code className="text-xs">VITE_SUPABASE_ANON_KEY</code> en un archivo{' '}
        <code className="text-xs">.env</code> para usar la app.
      </p>
    )
  }

  if (loading) {
    return <p className="text-ink-muted">Cargando tu espacio…</p>
  }

  if (error) {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
        {error}
      </p>
    )
  }

  const displayName = profile?.name ?? '…'

  return (
    <div>
      <div className="mb-2 flex items-start justify-between gap-2">
        <h1 className="text-2xl font-medium text-ink">
          Hola, {displayName}. ¿Cómo estás ahora?
        </h1>
        <Link
          to="/onboarding"
          className="shrink-0 text-xs text-clay-dark no-underline hover:underline"
        >
          Contactos
        </Link>
      </div>

      <CrisisLine className="mb-4" />
      <DisclaimerBanner className="mb-6" />

      {step.phase === 'mood' && (
        <>
          <MoodSelector
            onSelect={(mood) => {
              if (mood === 'consumed') {
                setStep({ phase: 'context', mood })
              } else {
                setStep({ phase: 'context', mood })
              }
            }}
          />
        </>
      )}

      {step.phase === 'context' && (
        <ContextSelector
          onBack={() => setStep({ phase: 'mood' })}
          onSelect={(context) => {
            const { mood } = step
            if (step.phase !== 'context') return
            if (mood === 'consumed') {
              setStep({ phase: 'relapse', context })
              return
            }
            const next = flowFor(mood, context)
            if (next === 'reflection') setStep({ phase: 'reflection', mood, context })
            else if (next === 'support') setStep({ phase: 'support', mood, context })
          }}
        />
      )}

      {step.phase === 'reflection' && (
        <ReflectionForm
          userId={user.id}
          mood={step.mood}
          context={step.context}
          onBack={reset}
          onSaved={reset}
        />
      )}

      {step.phase === 'support' && (
        <SupportMode
          userId={user.id}
          mood={step.mood}
          context={step.context}
          contacts={supportContacts}
          crisisMessage={crisisMessage}
          onBack={reset}
          onSavedNote={() => void refresh()}
        />
      )}

      {step.phase === 'relapse' && (
        <RelapseForm
          userId={user.id}
          context={step.context}
          contacts={supportContacts}
          crisisMessage={crisisMessage}
          onBack={reset}
          onComplete={reset}
        />
      )}
    </div>
  )
}
