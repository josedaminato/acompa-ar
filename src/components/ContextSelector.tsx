import type { SituationContext } from '../types/database'

const CONTEXTS: { id: SituationContext; label: string }[] = [
  { id: 'alone', label: 'Solo' },
  { id: 'good_company', label: 'Con alguien que me hace bien' },
  { id: 'people_using', label: 'Con gente que consume' },
  { id: 'home', label: 'En casa' },
  { id: 'street', label: 'En la calle' },
  { id: 'outing', label: 'En una salida o reunión' },
]

type Props = {
  onSelect: (ctx: SituationContext) => void
  onBack?: () => void
}

export function ContextSelector({ onSelect, onBack }: Props) {
  return (
    <div>
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="mb-4 cursor-pointer text-sm text-clay-dark"
        >
          ← Cambiar cómo me siento
        </button>
      )}
      <p className="mb-4 text-lg font-medium text-ink">¿Dónde estás ahora?</p>
      <div className="grid gap-3">
        {CONTEXTS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelect(c.id)}
            className="min-h-14 rounded-2xl border border-border-soft bg-surface px-4 py-3 text-left text-base text-ink shadow-sm transition hover:border-clay/50 hover:bg-cream"
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  )
}
