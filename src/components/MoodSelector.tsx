import type { Mood } from '../types/database'

const MOODS: { id: Mood; label: string }[] = [
  { id: 'tranquil', label: 'Estoy tranquilo' },
  { id: 'anxious', label: 'Estoy ansioso' },
  { id: 'lonely', label: 'Me siento solo' },
  { id: 'craving', label: 'Tengo ganas de consumir' },
  { id: 'others_using', label: 'Estoy con gente que consume' },
  { id: 'consumed', label: 'Consumí' },
]

type Props = {
  onSelect: (mood: Mood) => void
}

export function MoodSelector({ onSelect }: Props) {
  return (
    <div className="grid gap-3">
      {MOODS.map((m) => (
        <button
          key={m.id}
          type="button"
          onClick={() => onSelect(m.id)}
          className="min-h-14 rounded-2xl border border-border-soft bg-surface px-4 py-3 text-left text-base font-medium text-ink shadow-sm transition hover:border-clay/50 hover:bg-cream"
        >
          {m.label}
        </button>
      ))}
    </div>
  )
}
