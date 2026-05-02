import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { useProfile } from './hooks/useProfile'
import { AuthPage } from './components/AuthPage'
import { Dashboard } from './components/Dashboard'
import { HistoryPage } from './components/HistoryPage'
import { LandingPage } from './components/LandingPage'
import { Layout } from './components/Layout'
import { OnboardingContacts } from './components/OnboardingContacts'

function RequireAuth() {
  const { user, loading, demoMode } = useAuth()
  const location = useLocation()

  if (loading && !demoMode) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-cream px-4 text-ink-muted">
        Cargando…
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

function RequireOnboardingComplete() {
  const { onboardingComplete, loading } = useProfile()

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-cream px-4 text-ink-muted">
        Cargando tu perfil…
      </div>
    )
  }

  if (!onboardingComplete) {
    return <Navigate to="/onboarding" replace />
  }

  return <Outlet />
}

function AuthRedirectIfLoggedIn() {
  const { user, loading, demoMode } = useAuth()
  const { onboardingComplete, loading: profileLoading } = useProfile()

  if ((loading && !demoMode) || (user && profileLoading)) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-cream px-4 text-ink-muted">
        Cargando…
      </div>
    )
  }

  if (user) {
    return <Navigate to={onboardingComplete ? '/dashboard' : '/onboarding'} replace />
  }

  return <AuthPage />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthRedirectIfLoggedIn />} />
      <Route element={<RequireAuth />}>
        <Route element={<Layout />}>
          <Route path="/onboarding" element={<OnboardingContacts />} />
          <Route element={<RequireOnboardingComplete />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/historial" element={<HistoryPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
