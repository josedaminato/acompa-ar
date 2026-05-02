type Props = {
  /** Menos texto para pantallas ya cargadas (auth, onboarding). */
  variant?: 'full' | 'short'
  className?: string
}

/**
 * Mensajes de confianza: claros y humanos. Para políticas legales definitivas conviene
 * revisión profesional según jurisdicción.
 */
export function PrivacyTrustNote({ variant = 'full', className = '' }: Props) {
  if (variant === 'short') {
    return (
      <div
        role="region"
        aria-label="Privacidad y confianza"
        className={`rounded-2xl border border-sage-light/90 bg-surface/80 px-4 py-3 text-sm leading-relaxed text-ink-muted ${className}`}
      >
        <p className="m-0 font-medium text-ink">Tu espacio es privado</p>
        <p className="mt-2 mb-0">
          Lo que escribís queda en tu cuenta; no vendemos tus datos ni te observamos en tiempo
          real. Los contactos son para que vos elijas cuándo escribirles — esta herramienta no
          les manda mensajes sola.
        </p>
      </div>
    )
  }

  return (
    <div
      role="region"
      aria-label="Privacidad y confianza"
      className={`rounded-2xl border border-sage-light/90 bg-surface/80 px-4 py-4 text-sm leading-relaxed text-ink-muted ${className}`}
    >
      <p className="m-0 font-medium text-ink">Privacidad y confianza</p>
      <ul className="mt-3 mb-0 list-disc space-y-2 pl-5 marker:text-sage">
        <li>
          Tus registros y notas están pensados para tu uso personal; no los usamos para publicidad
          ni los vendemos.
        </li>
        <li>
          Nadie del otro lado “te vigila”: esto es una herramienta para cuando vos decidís abrirla,
          no un seguimiento en vivo.
        </li>
        <li>
          Los teléfonos que cargás sirven para que vos puedas contactarlos cuando lo necesites;
          por ahora la app no les envía mensajes automáticos.
        </li>
      </ul>
    </div>
  )
}
