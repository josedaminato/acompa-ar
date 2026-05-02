import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { DisclaimerBanner } from './DisclaimerBanner'

export function Layout() {
  const { user, signOut, demoMode } = useAuth()

  return (
    <div className="flex min-h-dvh flex-col">
      {demoMode && (
        <div
          role="status"
          className="border-b border-sage-light bg-sage-light/40 px-4 py-2 text-center text-xs leading-snug text-ink"
        >
          <strong>Vista previa interna</strong> — nada se guarda en servidor; solo en este
          dispositivo. Para uso real creá cuenta con Supabase configurado.
        </div>
      )}
      <header className="sticky top-0 z-10 border-b border-border-soft bg-cream/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-3">
          <Link
            to={user ? '/dashboard' : '/'}
            className="text-base font-medium tracking-tight text-ink no-underline"
          >
            Acompañar
          </Link>
          <nav className="flex items-center gap-2 text-sm">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="rounded-lg px-2 py-1.5 text-ink-muted no-underline hover:bg-surface hover:text-ink"
                >
                  Inicio
                </Link>
                <Link
                  to="/historial"
                  className="rounded-lg px-2 py-1.5 text-ink-muted no-underline hover:bg-surface hover:text-ink"
                >
                  Historial
                </Link>
                <button
                  type="button"
                  onClick={() => void signOut()}
                  className="cursor-pointer rounded-lg border border-border-soft bg-surface px-3 py-1.5 text-ink text-sm"
                >
                  Salir
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="rounded-lg bg-clay-dark px-3 py-1.5 text-white no-underline"
              >
                Entrar
              </Link>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-6 pb-16">
        <DisclaimerBanner className="mb-6" />
        <Outlet />
      </main>
    </div>
  )
}

export function PublicLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Outlet />
    </div>
  )
}
