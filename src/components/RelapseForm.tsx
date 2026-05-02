import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { appendDemoCheckin, appendDemoRelapse } from '../demo/demoStorage'
import { supabase } from '../lib/supabase'
import type { SituationContext } from '../types/database'
import { CrisisLine, DisclaimerBanner } from './DisclaimerBanner'
import { ContactButton } from './ContactButton'
import type { Database } from '../types/database'

type ContactRow = Database['public']['Tables']['support_contacts']['Row']

type Props = {
  userId: string
  context: SituationContext
  contacts: ContactRow[]
  crisisMessage: string
  onComplete: () => void
  onBack: () => void
}

export function RelapseForm({
  userId,
  context,
  contacts,
  crisisMessage,
  onComplete,
  onBack,
}: Props) {
  const { demoMode } = useAuth()
  const [location, setLocation] = useState('')
  const [peopleContext, setPeopleContext] = useState('')
  const [emotionBefore, setEmotionBefore] = useState('')
  const [trigger, setTrigger] = useState('')
  const [nextAction, setNextAction] = useState('')
  const [notify, setNotify] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      if (demoMode) {
        appendDemoRelapse({
          user_id: userId,
          location: location.trim() || null,
          people_context: peopleContext.trim() || null,
          emotion_before: emotionBefore.trim() || null,
          trigger: trigger.trim() || null,
          next_action: nextAction.trim() || null,
          notified_someone: notify,
        })
        appendDemoCheckin({
          user_id: userId,
          mood: 'consumed',
          context,
          craving_intensity: null,
          consumed: true,
          had_urge: false,
          note: 'Registro de recaída guardado.',
        })
        onComplete()
        return
      }
      const { error: rErr } = await supabase.from('relapse_logs').insert({
        user_id: userId,
        location: location.trim() || null,
        people_context: peopleContext.trim() || null,
        emotion_before: emotionBefore.trim() || null,
        trigger: trigger.trim() || null,
        next_action: nextAction.trim() || null,
        notified_someone: notify,
      })
      if (rErr) throw rErr

      const { error: cErr } = await supabase.from('daily_checkins').insert({
        user_id: userId,
        mood: 'consumed',
        context,
        consumed: true,
        had_urge: false,
        note: 'Registro de recaída guardado.',
      })
      if (cErr) throw cErr

      onComplete()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar.')
    } finally {
      setSaving(false)
    }
  }

  const supportList = contacts.filter((c) => c.role !== 'therapist')

  return (
    <div>
      <button type="button" onClick={onBack} className="mb-4 text-sm text-clay-dark">
        ← Volver
      </button>

      <CrisisLine className="mb-4" />
      <DisclaimerBanner variant="emphasis" className="mb-6" />

      <h2 className="mb-2 text-xl font-medium text-ink">
        Pasó. No sos esto. Podemos usarlo para entender qué ocurrió.
      </h2>
      <p className="mb-6 text-ink-muted leading-relaxed">
        Respondé lo que puedas. No hay respuestas correctas. Esto es información para vos.
      </p>

      <form onSubmit={(e) => void submit(e)} className="space-y-4">
        <Field label="¿Dónde estabas?" value={location} onChange={setLocation} />
        <Field
          label="¿Con quién estabas?"
          value={peopleContext}
          onChange={setPeopleContext}
        />
        <Field
          label="¿Qué sentías antes?"
          value={emotionBefore}
          onChange={setEmotionBefore}
        />
        <Field label="¿Qué lo activó?" value={trigger} onChange={setTrigger} />
        <Field
          label="¿Qué podrías hacer distinto mañana?"
          value={nextAction}
          onChange={setNextAction}
        />

        <div className="rounded-xl border border-border-soft bg-surface p-4">
          <p className="mb-3 text-sm font-medium text-ink">¿Querés avisarle a alguien?</p>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={notify}
              onChange={(e) => setNotify(e.target.checked)}
            />
            Sí, quiero avisar (marcá acá y usá WhatsApp abajo si querés)
          </label>
          {notify && supportList.length > 0 && (
            <div className="mt-4 flex flex-col gap-2">
              {supportList.map((c) => (
                <ContactButton
                  key={c.id}
                  name={c.name}
                  phone={c.phone}
                  message={crisisMessage}
                />
              ))}
            </div>
          )}
        </div>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-2xl bg-clay-dark py-3 font-medium text-white disabled:opacity-60"
        >
          {saving ? 'Guardando…' : 'Guardar registro'}
        </button>
      </form>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-ink">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        className="w-full rounded-xl border border-border-soft bg-surface px-4 py-3 text-ink"
      />
    </div>
  )
}
