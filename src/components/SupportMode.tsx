import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { appendDemoCheckin } from '../demo/demoStorage'
import { supabase } from '../lib/supabase'
import type { Database } from '../types/database'
import type { Mood, SituationContext } from '../types/database'
import { BreathingExercise } from './BreathingExercise'
import { ContactButton } from './ContactButton'
import { CrisisLine, DisclaimerBanner } from './DisclaimerBanner'

type ContactRow = Database['public']['Tables']['support_contacts']['Row']

type Props = {
  userId: string
  mood: Mood
  context: SituationContext
  contacts: ContactRow[]
  crisisMessage: string
  onBack: () => void
  onSavedNote?: () => void
}

export function SupportMode({
  userId,
  mood,
  context,
  contacts,
  crisisMessage,
  onBack,
  onSavedNote,
}: Props) {
  const { demoMode } = useAuth()
  const [vent, setVent] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)

  async function saveVent() {
    if (!vent.trim()) return
    setSaving(true)
    setSaveMsg(null)
    if (demoMode) {
      appendDemoCheckin({
        user_id: userId,
        mood,
        context,
        craving_intensity: null,
        had_urge: mood === 'craving' || mood === 'anxious',
        consumed: false,
        note: vent.trim(),
      })
      setSaving(false)
      setSaveMsg('Listo, guardamos lo que escribiste (solo en este navegador).')
      onSavedNote?.()
      return
    }
    const { error } = await supabase.from('daily_checkins').insert({
      user_id: userId,
      mood,
      context,
      had_urge: mood === 'craving' || mood === 'anxious',
      consumed: false,
      note: vent.trim(),
    })
    setSaving(false)
    if (error) {
      setSaveMsg('No se pudo guardar la nota. Podés seguir igual.')
      return
    }
    setSaveMsg('Listo, guardamos lo que escribiste.')
    onSavedNote?.()
  }

  const supportList = contacts.filter((c) => c.role !== 'therapist')

  return (
    <div>
      <button type="button" onClick={onBack} className="mb-4 text-sm text-clay-dark">
        ← Volver al inicio
      </button>

      <CrisisLine className="mb-4" />
      <DisclaimerBanner variant="emphasis" className="mb-6" />

      <h2 className="mb-2 text-xl font-medium text-ink">
        No tenés que resolver todo ahora. Hagamos una cosa concreta.
      </h2>
      <p className="mb-8 text-ink-muted leading-relaxed">
        Elegí lo que te resulte más posible en este momento.
      </p>

      <section className="mb-8 rounded-2xl border border-border-soft bg-surface p-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-sage">
          A) Contactar a alguien
        </h3>
        {supportList.length === 0 ? (
          <p className="text-sm text-ink-muted">
            Todavía no hay contactos cargados. Podés agregarlos en configuración.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
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
      </section>

      <section className="mb-8 rounded-2xl border border-border-soft bg-surface p-4">
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-sage">
          B) Salir de la situación
        </h3>
        <p className="mb-4 text-sm leading-relaxed text-ink-muted">
          Tomá distancia 5 minutos. No hace falta explicar todo ahora.
        </p>
        <ul className="m-0 list-none space-y-2 p-0 text-sm text-ink">
          <li className="rounded-lg bg-cream px-3 py-2">Voy a caminar 5 minutos</li>
          <li className="rounded-lg bg-cream px-3 py-2">Voy al baño / salgo un momento</li>
          <li className="rounded-lg bg-cream px-3 py-2">Me alejo de la situación</li>
        </ul>
      </section>

      <section className="mb-8">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-sage">
          C) Bajar intensidad
        </h3>
        <BreathingExercise />
      </section>

      <section className="rounded-2xl border border-border-soft bg-surface p-4">
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-sage">
          D) Descargar lo que sentís
        </h3>
        <p className="mb-3 text-sm text-ink-muted">
          Escribí sin ordenar demasiado. ¿Qué está pasando ahora?
        </p>
        <textarea
          value={vent}
          onChange={(e) => setVent(e.target.value)}
          rows={5}
          className="mb-3 w-full rounded-xl border border-border-soft bg-cream px-4 py-3 text-ink"
        />
        <button
          type="button"
          disabled={saving || !vent.trim()}
          onClick={() => void saveVent()}
          className="w-full rounded-xl border border-clay-dark bg-transparent py-2.5 font-medium text-clay-dark disabled:opacity-50"
        >
          {saving ? 'Guardando…' : 'Guardar esta nota'}
        </button>
        {saveMsg && <p className="mt-2 text-sm text-sage">{saveMsg}</p>}
      </section>
    </div>
  )
}
