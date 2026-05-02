type Props = {
  variant?: 'default' | 'emphasis'
  className?: string
}

export function DisclaimerBanner({ variant = 'default', className = '' }: Props) {
  const base =
    variant === 'emphasis'
      ? 'border-rose-soft bg-rose-soft/50 text-ink'
      : 'border-border-soft bg-surface/80 text-ink-muted'

  return (
    <div
      role="note"
      className={`rounded-xl border px-4 py-3 text-sm leading-relaxed ${base} ${className}`}
    >
      <p className="m-0">
        Esta herramienta es de apoyo y no reemplaza tratamiento profesional ni atención
        médica.
      </p>
    </div>
  )
}

export function CrisisLine({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded-xl border border-clay/40 bg-cream px-4 py-3 text-sm text-ink ${className}`}
    >
      <p className="m-0 font-medium">
        Si sentís que estás en peligro o podés hacerte daño, contactá a emergencias, a
        tu terapeuta o a una persona de confianza ahora.
      </p>
    </div>
  )
}
