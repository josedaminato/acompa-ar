import { useEffect, useState } from 'react'

const INHALE = 4
const HOLD = 2
const EXHALE = 6
const CYCLE = INHALE + HOLD + EXHALE
const TOTAL_SECONDS = 60

type Phase = 'inhale' | 'hold' | 'exhale'

function phaseAt(elapsedInCycle: number): { phase: Phase; secondsLeft: number } {
  if (elapsedInCycle < INHALE) {
    return { phase: 'inhale', secondsLeft: INHALE - elapsedInCycle }
  }
  if (elapsedInCycle < INHALE + HOLD) {
    return { phase: 'hold', secondsLeft: INHALE + HOLD - elapsedInCycle }
  }
  return { phase: 'exhale', secondsLeft: CYCLE - elapsedInCycle }
}

const LABELS: Record<Phase, string> = {
  inhale: 'Inhalá (4 seg)',
  hold: 'Sostené (2 seg)',
  exhale: 'Exhalá (6 seg)',
}

export function BreathingExercise() {
  const [running, setRunning] = useState(false)
  const [totalLeft, setTotalLeft] = useState(TOTAL_SECONDS)
  const [phaseInfo, setPhaseInfo] = useState(() => phaseAt(0))

  useEffect(() => {
    if (!running) return
    const started = Date.now()
    const tick = () => {
      const elapsed = Math.floor((Date.now() - started) / 1000)
      const left = Math.max(0, TOTAL_SECONDS - elapsed)
      setTotalLeft(left)
      const inCycle = elapsed % CYCLE
      setPhaseInfo(phaseAt(inCycle))
      if (left <= 0) setRunning(false)
    }
    tick()
    const id = window.setInterval(tick, 250)
    return () => window.clearInterval(id)
  }, [running])

  return (
    <div className="rounded-2xl border border-sage-light bg-surface/80 p-4">
      <p className="mb-2 text-sm font-medium text-ink">Respiración 4-2-6 (60 seg)</p>
      <p className="mb-4 text-xs text-ink-muted">
        Inhalá 4 segundos, sostené 2, exhalá 6. No tiene que salir perfecto.
      </p>
      {!running ? (
        <button
          type="button"
          onClick={() => {
            setTotalLeft(TOTAL_SECONDS)
            setPhaseInfo(phaseAt(0))
            setRunning(true)
          }}
          className="w-full rounded-xl bg-sage py-3 font-medium text-white"
        >
          Empezar 1 minuto
        </button>
      ) : (
        <div className="text-center">
          <p className="text-3xl font-medium tabular-nums text-ink">{totalLeft}s</p>
          <p className="mt-2 text-lg text-clay-dark">{LABELS[phaseInfo.phase]}</p>
          <p className="text-sm text-ink-muted">
            Fase: ~{Math.ceil(phaseInfo.secondsLeft)}s
          </p>
          <button
            type="button"
            onClick={() => setRunning(false)}
            className="mt-4 text-sm text-ink-muted underline"
          >
            Detener
          </button>
        </div>
      )}
    </div>
  )
}
