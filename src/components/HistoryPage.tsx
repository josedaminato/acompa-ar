import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, supabaseConfigured } from '../lib/supabase'
import type { Database } from '../types/database'
import { DisclaimerBanner } from './DisclaimerBanner'

type Checkin = Database['public']['Tables']['daily_checkins']['Row']
type Relapse = Database['public']['Tables']['relapse_logs']['Row']

export function HistoryPage() {
  const { user } = useAuth()
  const [checkins, setCheckins] = useState<Checkin[]>([])
  const [relapses, setRelapses] = useState<Relapse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!user || !supabaseConfigured) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    const [cRes, rRes] = await Promise.all([
      supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(80),
      supabase
        .from('relapse_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(40),
    ])
    if (cRes.error) setError(cRes.error.message)
    else setCheckins(cRes.data ?? [])
    if (rRes.error) setError(rRes.error.message)
    else setRelapses(rRes.data ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    void load()
  }, [load])

  const stats = useMemo(() => {
    const consumedDays = new Set<string>()
    const urgeDays = new Set<string>()
    const relapseDays = new Set<string>()
    const contextCount: Record<string, number> = {}

    for (const r of relapses) {
      relapseDays.add(r.created_at.slice(0, 10))
    }
    for (const c of checkins) {
      const day = c.created_at.slice(0, 10)
      if (c.consumed) consumedDays.add(day)
      if (c.had_urge) urgeDays.add(day)
      if (c.context) contextCount[c.context] = (contextCount[c.context] ?? 0) + 1
    }

    const sortedContexts = Object.entries(contextCount).sort((a, b) => b[1] - a[1])

    return {
      totalCheckins: checkins.length,
      daysConsumed: consumedDays.size,
      daysUrge: urgeDays.size,
      daysRelapse: relapseDays.size,
      sortedContexts,
    }
  }, [checkins, relapses])

  if (!supabaseConfigured) {
    return <p className="text-sm text-ink-muted">Supabase no configurado.</p>
  }

  if (loading) return <p className="text-ink-muted">Cargando historial…</p>
  if (error)
    return (
      <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">
        {error}
      </p>
    )

  return (
    <div>
      <h1 className="mb-2 text-2xl font-medium text-ink">Tu historial</h1>
      <p className="mb-2 rounded-xl border border-sage-light bg-surface/80 px-4 py-3 text-sm leading-relaxed text-ink-muted">
        El progreso no es perfección. Es volver al camino con más información.
      </p>
      <DisclaimerBanner className="mb-6" />

      <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Registros" value={stats.totalCheckins} />
        <Stat label="Días con consumo (reg.)" value={stats.daysConsumed} />
        <Stat label="Días con impulso" value={stats.daysUrge} />
        <Stat label="Recaídas guardadas" value={relapses.length} />
      </section>

      {stats.sortedContexts.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-2 text-sm font-semibold text-ink">Contextos frecuentes</h2>
          <ul className="m-0 list-none space-y-2 p-0 text-sm text-ink-muted">
            {stats.sortedContexts.slice(0, 6).map(([ctx, n]) => (
              <li key={ctx} className="flex justify-between rounded-lg bg-surface px-3 py-2">
                <span>{ctx}</span>
                <span className="text-ink">{n}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold text-ink">Registros recientes</h2>
        {checkins.length === 0 ? (
          <p className="text-sm text-ink-muted">Todavía no hay registros.</p>
        ) : (
          <ul className="m-0 list-none space-y-3 p-0">
            {checkins.slice(0, 20).map((c) => (
              <li
                key={c.id}
                className="rounded-xl border border-border-soft bg-surface px-4 py-3 text-sm"
              >
                <p className="m-0 text-xs text-sage">
                  {new Date(c.created_at).toLocaleString('es-AR', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </p>
                <p className="mt-1 mb-0 text-ink">
                  <span className="font-medium">{c.mood}</span>
                  {c.context ? ` · ${c.context}` : ''}
                </p>
                {c.note && (
                  <p className="mt-2 mb-0 whitespace-pre-wrap text-ink-muted">{c.note}</p>
                )}
                <p className="mt-2 mb-0 text-xs text-ink-muted">
                  {c.consumed ? 'Consumo: sí' : 'Consumo: no'}
                  {' · '}
                  {c.had_urge ? 'Impulso: sí' : 'Impulso: no'}
                  {c.craving_intensity != null
                    ? ` · Intensidad: ${c.craving_intensity}/10`
                    : ''}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {relapses.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-ink">Notas de recaída</h2>
          <ul className="m-0 list-none space-y-3 p-0">
            {relapses.map((r) => (
              <li
                key={r.id}
                className="rounded-xl border border-rose-soft bg-rose-soft/20 px-4 py-3 text-sm"
              >
                <p className="m-0 text-xs text-sage">
                  {new Date(r.created_at).toLocaleString('es-AR', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </p>
                {r.location && (
                  <p className="mt-1 mb-0 text-ink-muted">Dónde: {r.location}</p>
                )}
                {r.trigger && (
                  <p className="mt-1 mb-0 text-ink-muted">Activó: {r.trigger}</p>
                )}
                {r.next_action && (
                  <p className="mt-1 mb-0 text-ink-muted">Próximo paso: {r.next_action}</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border-soft bg-surface px-3 py-3 text-center">
      <p className="m-0 text-2xl font-medium tabular-nums text-ink">{value}</p>
      <p className="mt-1 mb-0 text-xs leading-tight text-ink-muted">{label}</p>
    </div>
  )
}
