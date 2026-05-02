import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import {
  clearDemoSession,
  DEMO_USER,
  isDemoSessionActive,
  setDemoSessionActive,
} from '../demo/demoStorage'
import { supabase, supabaseConfigured } from '../lib/supabase'

type AuthContextValue = {
  user: User | null
  session: Session | null
  loading: boolean
  /** Sesión simulada para mostrar la app sin Supabase (solo en este navegador). */
  demoMode: boolean
  enterDemoMode: () => void
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (
    email: string,
    password: string,
    name: string,
  ) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readInitialDemo(): boolean {
  if (typeof sessionStorage === 'undefined') return false
  return isDemoSessionActive()
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [demoMode, setDemoMode] = useState(readInitialDemo)

  useEffect(() => {
    if (!supabaseConfigured) {
      setLoading(false)
      return
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
      if (next?.user) {
        clearDemoSession()
        setDemoMode(false)
      }
      setLoading(false)
    })

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      if (s?.user) {
        clearDemoSession()
        setDemoMode(false)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const enterDemoMode = useCallback(() => {
    setDemoSessionActive()
    setDemoMode(true)
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabaseConfigured) {
      return { error: new Error('Supabase no está configurado.') }
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error ? new Error(error.message) : null }
  }, [])

  const signUp = useCallback(
    async (email: string, password: string, name: string) => {
      if (!supabaseConfigured) {
        return { error: new Error('Supabase no está configurado.') }
      }
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      })
      return { error: error ? new Error(error.message) : null }
    },
    [],
  )

  const signOut = useCallback(async () => {
    clearDemoSession()
    setDemoMode(false)
    if (supabaseConfigured) await supabase.auth.signOut()
  }, [])

  const user = useMemo(() => {
    if (demoMode) return DEMO_USER
    return session?.user ?? null
  }, [demoMode, session?.user])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session: demoMode ? null : session,
      loading,
      demoMode,
      enterDemoMode,
      signIn,
      signUp,
      signOut,
    }),
    [user, session, loading, demoMode, enterDemoMode, signIn, signUp, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
