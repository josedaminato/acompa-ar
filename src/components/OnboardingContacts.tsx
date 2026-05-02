import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { replaceDemoProfileAndContacts } from '../demo/demoStorage'
import { supabase, supabaseConfigured } from '../lib/supabase'
import { useProfile } from '../hooks/useProfile'
import type { Database } from '../types/database'
import { DisclaimerBanner } from './DisclaimerBanner'
import { PrivacyTrustNote } from './PrivacyTrustNote'

const PRESET_MESSAGES = [
  'Estoy pasando un momento difícil y necesito hablar con alguien. ¿Podés responderme?',
  'Estoy con ganas de consumir y no quiero estar solo ahora. ¿Podés hablar conmigo?',
  'Estoy en un lugar donde están consumiendo y me está costando. ¿Podés llamarme?',
]

type ProfileRow = Database['public']['Tables']['users_profile']['Row']
type ContactRow = Database['public']['Tables']['support_contacts']['Row']

export function OnboardingContacts() {
  const { user, demoMode } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { profile, contacts, loading: profileLoading, refresh } = useProfile()
  const prefilled = useRef(false)

  const stateName = (location.state as { name?: string } | null)?.name ?? ''

  const [displayName, setDisplayName] = useState(stateName)
  const [c1Name, setC1Name] = useState('')
  const [c1Phone, setC1Phone] = useState('')
  const [c2Name, setC2Name] = useState('')
  const [c2Phone, setC2Phone] = useState('')
  const [c3Name, setC3Name] = useState('')
  const [c3Phone, setC3Phone] = useState('')
  const [therapistName, setTherapistName] = useState('')
  const [therapistPhone, setTherapistPhone] = useState('')
  const [crisisMessage, setCrisisMessage] = useState(PRESET_MESSAGES[0] ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (profile?.name) setDisplayName(profile.name)
    if (profile?.crisis_message) setCrisisMessage(profile.crisis_message)
  }, [profile])

  useEffect(() => {
    if (profileLoading || prefilled.current || contacts.length === 0) return
    prefilled.current = true
    for (const c of contacts) {
      if (c.role === 'support_1') {
        setC1Name(c.name)
        setC1Phone(c.phone)
      }
      if (c.role === 'support_2') {
        setC2Name(c.name)
        setC2Phone(c.phone)
      }
      if (c.role === 'support_3') {
        setC3Name(c.name)
        setC3Phone(c.phone)
      }
      if (c.role === 'therapist') {
        setTherapistName(c.name)
        setTherapistPhone(c.phone)
      }
    }
  }, [profileLoading, contacts])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!user) {
      setError('No hay sesión.')
      return
    }
    if (!displayName.trim()) {
      setError('Necesitamos tu nombre.')
      return
    }
    if (!c1Name.trim() || !c1Phone.trim() || !c2Name.trim() || !c2Phone.trim()) {
      setError('Completá al menos dos contactos de apoyo con nombre y teléfono.')
      return
    }

    if (demoMode) {
      setSubmitting(true)
      try {
        const now = new Date().toISOString()
        const profileRow: ProfileRow = {
          id: profile?.id ?? 'demo-profile',
          user_id: user.id,
          name: displayName.trim(),
          crisis_message: crisisMessage.trim() || null,
          created_at: profile?.created_at ?? now,
        }
        const rows: ContactRow[] = [
          {
            id: crypto.randomUUID(),
            user_id: user.id,
            name: c1Name.trim(),
            phone: c1Phone.trim(),
            role: 'support_1',
            created_at: now,
          },
          {
            id: crypto.randomUUID(),
            user_id: user.id,
            name: c2Name.trim(),
            phone: c2Phone.trim(),
            role: 'support_2',
            created_at: now,
          },
        ]
        if (c3Name.trim() && c3Phone.trim()) {
          rows.push({
            id: crypto.randomUUID(),
            user_id: user.id,
            name: c3Name.trim(),
            phone: c3Phone.trim(),
            role: 'support_3',
            created_at: now,
          })
        }
        if (therapistName.trim() && therapistPhone.trim()) {
          rows.push({
            id: crypto.randomUUID(),
            user_id: user.id,
            name: therapistName.trim(),
            phone: therapistPhone.trim(),
            role: 'therapist',
            created_at: now,
          })
        }
        replaceDemoProfileAndContacts(profileRow, rows)
        await refresh()
        navigate('/dashboard', { replace: true })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo guardar.')
      } finally {
        setSubmitting(false)
      }
      return
    }

    if (!supabaseConfigured) {
      setError('Falta configurar Supabase en .env o usá la vista previa desde la landing.')
      return
    }

    setSubmitting(true)
    try {
      const profilePayload = {
        user_id: user.id,
        name: displayName.trim(),
        crisis_message: crisisMessage.trim() || null,
      }

      const existing = profile?.id
      if (existing) {
        const { error: upErr } = await supabase
          .from('users_profile')
          .update({
            name: profilePayload.name,
            crisis_message: profilePayload.crisis_message,
          })
          .eq('user_id', user.id)
        if (upErr) throw upErr
      } else {
        const { error: insErr } = await supabase.from('users_profile').insert(profilePayload)
        if (insErr) throw insErr
      }

      await supabase.from('support_contacts').delete().eq('user_id', user.id)

      const rows: {
        user_id: string
        name: string
        phone: string
        role: 'support_1' | 'support_2' | 'support_3' | 'therapist'
      }[] = [
        {
          user_id: user.id,
          name: c1Name.trim(),
          phone: c1Phone.trim(),
          role: 'support_1',
        },
        {
          user_id: user.id,
          name: c2Name.trim(),
          phone: c2Phone.trim(),
          role: 'support_2',
        },
      ]
      if (c3Name.trim() && c3Phone.trim()) {
        rows.push({
          user_id: user.id,
          name: c3Name.trim(),
          phone: c3Phone.trim(),
          role: 'support_3',
        })
      }
      if (therapistName.trim() && therapistPhone.trim()) {
        rows.push({
          user_id: user.id,
          name: therapistName.trim(),
          phone: therapistPhone.trim(),
          role: 'therapist',
        })
      }

      const { error: cErr } = await supabase.from('support_contacts').insert(rows)
      if (cErr) throw cErr

      await refresh()
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar. Intentá de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <h1 className="mb-2 text-2xl font-medium text-ink">Configuración inicial</h1>
      <p className="mb-6 text-ink-muted leading-relaxed">
        Guardá personas a las que puedas escribir cuando lo necesites. Podés cambiar esto
        más adelante volviendo a esta pantalla desde tu cuenta (por ahora, editá
        reenviando el formulario si hace falta).
      </p>

      <PrivacyTrustNote variant="short" className="mb-6" />

      <form onSubmit={(e) => void onSubmit(e)} className="space-y-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Tu nombre</label>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full rounded-xl border border-border-soft bg-surface px-4 py-3 text-ink outline-none ring-clay-dark/30 focus:ring-2"
          />
        </div>

        <fieldset className="space-y-3 rounded-2xl border border-border-soft bg-surface/60 p-4">
          <legend className="px-1 text-sm font-medium text-ink">Contacto de apoyo 1</legend>
          <input
            placeholder="Nombre"
            value={c1Name}
            onChange={(e) => setC1Name(e.target.value)}
            className="w-full rounded-xl border border-border-soft bg-surface px-4 py-3 text-ink"
          />
          <input
            placeholder="Teléfono (con código de país si podés)"
            value={c1Phone}
            onChange={(e) => setC1Phone(e.target.value)}
            className="w-full rounded-xl border border-border-soft bg-surface px-4 py-3 text-ink"
          />
        </fieldset>

        <fieldset className="space-y-3 rounded-2xl border border-border-soft bg-surface/60 p-4">
          <legend className="px-1 text-sm font-medium text-ink">Contacto de apoyo 2</legend>
          <input
            placeholder="Nombre"
            value={c2Name}
            onChange={(e) => setC2Name(e.target.value)}
            className="w-full rounded-xl border border-border-soft bg-surface px-4 py-3 text-ink"
          />
          <input
            placeholder="Teléfono"
            value={c2Phone}
            onChange={(e) => setC2Phone(e.target.value)}
            className="w-full rounded-xl border border-border-soft bg-surface px-4 py-3 text-ink"
          />
        </fieldset>

        <fieldset className="space-y-3 rounded-2xl border border-dashed border-sage-light bg-surface/40 p-4">
          <legend className="px-1 text-sm font-medium text-ink">Contacto 3 (opcional)</legend>
          <input
            placeholder="Nombre"
            value={c3Name}
            onChange={(e) => setC3Name(e.target.value)}
            className="w-full rounded-xl border border-border-soft bg-surface px-4 py-3 text-ink"
          />
          <input
            placeholder="Teléfono"
            value={c3Phone}
            onChange={(e) => setC3Phone(e.target.value)}
            className="w-full rounded-xl border border-border-soft bg-surface px-4 py-3 text-ink"
          />
        </fieldset>

        <fieldset className="space-y-3 rounded-2xl border border-dashed border-sage-light bg-surface/40 p-4">
          <legend className="px-1 text-sm font-medium text-ink">Terapeuta (opcional)</legend>
          <input
            placeholder="Nombre"
            value={therapistName}
            onChange={(e) => setTherapistName(e.target.value)}
            className="w-full rounded-xl border border-border-soft bg-surface px-4 py-3 text-ink"
          />
          <input
            placeholder="Teléfono"
            value={therapistPhone}
            onChange={(e) => setTherapistPhone(e.target.value)}
            className="w-full rounded-xl border border-border-soft bg-surface px-4 py-3 text-ink"
          />
        </fieldset>

        <div>
          <label className="mb-2 block text-sm font-medium text-ink">
            Cuando estés en un momento difícil, ¿qué mensaje querés enviar?
          </label>
          <div className="mb-2 flex flex-col gap-2">
            {PRESET_MESSAGES.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setCrisisMessage(m)}
                className={`rounded-xl border px-3 py-2 text-left text-sm leading-snug ${
                  crisisMessage === m
                    ? 'border-clay-dark bg-rose-soft/40'
                    : 'border-border-soft bg-surface'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <textarea
            value={crisisMessage}
            onChange={(e) => setCrisisMessage(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-border-soft bg-surface px-4 py-3 text-ink"
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
          className="w-full min-h-12 cursor-pointer rounded-2xl bg-clay-dark py-3 font-medium text-white disabled:opacity-60"
        >
          {submitting ? 'Guardando…' : 'Guardar y continuar'}
        </button>
      </form>

      <div className="mt-8">
        <DisclaimerBanner />
      </div>
    </div>
  )
}
