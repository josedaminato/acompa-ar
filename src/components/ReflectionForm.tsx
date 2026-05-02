import { useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Mood, SituationContext } from '../types/database'

type ReflectionKind =
  | 'feelings'
  | 'learned'
  | 'why_improve'
  | 'daily'

const KIND_LABELS: Record<ReflectionKind, string> = {
  feelings: 'Escribir cómo me siento',
  learned: 'Registrar algo que aprendí hoy',
  why_improve: 'Recordar por qué quiero seguir mejorando',
  daily: 'Guardar registro del día',
}

type Props = {
  userId: string
  mood: Mood
  context: SituationContext
  onSaved: () => void
  onBack: () => void
}

export function ReflectionForm({ userId, mood, context, onSaved, onBack }: Props) {
  const [kind, setKind] = useState<ReflectionKind | null>(null)
  const [note, setNote] = useState('')
  const [intensity, setIntensity] = useState(5)
  const [consumed, setConsumed] = useState(false)
  const [hadUrge, setHadUrge] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function save() {
    setError(null)
    setSaving(true)
    try {
      const prefix = kind ? `[${KIND_LABELS[kind]}] ` : ''
      const { error: err } = await supabase.from('daily_checkins').insert({
        user_id: userId,
        mood,
        context,
        craving_intensity: intensity,
        consumed,
        had_urge: hadUrge,
        note: `${prefix}${note.trim()}`.trim() || null,
      })
      if (err) throw err
      onSaved()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <button type="button" onClick={onBack} className="mb-4 text-sm text-clay-dark">
        ← Volver
      </button>
      <h2 className="mb-2 text-xl font-medium text-ink">
        Este puede ser un buen momento para estar con vos.
      </h2>
      <p className="mb-6 text-ink-muted">
        Elegí una opción o escribí libremente abajo y guardá cuando quieras.
      </p>

      <div className="mb-6 grid gap-2">
        {(Object.keys(KIND_LABELS) as ReflectionKind[]).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setKind(k)}
            className={`rounded-xl border px-4 py-3 text-left text-sm ${
              kind === k
                ? 'border-clay-dark bg-rose-soft/30'
                : 'border-border-soft bg-surface'
            }`}
          >
            {KIND_LABELS[k]}
          </button>
        ))}
      </div>

      <label className="mb-1 block text-sm font-medium text-ink">Nota libre</label>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={4}
        placeholder="Lo que quieras registrar…"
        className="mb-4 w-full rounded-xl border border-border-soft bg-surface px-4 py-3 text-ink"
      />

      <p className="mb-2 text-sm font-medium text-ink">Intensidad del día (1 a 10)</p>
      <input
        type="range"
        min={1}
        max={10}
        value={intensity}
        onChange={(e) => setIntensity(Number(e.target.value))}
        className="mb-4 w-full"
      />
      <p className="mb-4 text-sm text-ink-muted">Valor: {intensity}</p>

      <div className="mb-4 flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={consumed}
            onChange={(e) => setConsumed(e.target.checked)}
          />
          ¿Hubo consumo?
        </label>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={hadUrge}
            onChange={(e) => setHadUrge(e.target.checked)}
          />
          ¿Hubo impulso?
        </label>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
          {error}
        </p>
      )}

      <button
        type="button"
        disabled={saving}
        onClick={() => void save()}
        className="w-full rounded-2xl bg-clay-dark py-3 font-medium text-white disabled:opacity-60"
      >
        {saving ? 'Guardando…' : 'Guardar registro'}
      </button>
    </div>
  )
}
