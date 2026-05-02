import { useCallback, useEffect, useState } from 'react'
import { DEMO_USER_ID, loadDemoBundle } from '../demo/demoStorage'
import { supabase, supabaseConfigured } from '../lib/supabase'
import type { Database } from '../types/database'
import { useAuth } from '../contexts/AuthContext'

type ProfileRow = Database['public']['Tables']['users_profile']['Row']
type ContactRow = Database['public']['Tables']['support_contacts']['Row']

export function useProfile() {
  const { user, demoMode } = useAuth()
  const [profile, setProfile] = useState<ProfileRow | null>(null)
  const [contacts, setContacts] = useState<ContactRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!user) {
      setProfile(null)
      setContacts([])
      setLoading(false)
      return
    }

    if (demoMode && user.id === DEMO_USER_ID) {
      setLoading(true)
      setError(null)
      const b = loadDemoBundle()
      setProfile(b.profile)
      setContacts(b.contacts)
      setLoading(false)
      return
    }

    if (!supabaseConfigured) {
      setProfile(null)
      setContacts([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    const [pRes, cRes] = await Promise.all([
      supabase.from('users_profile').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('support_contacts').select('*').eq('user_id', user.id),
    ])
    if (pRes.error) setError(pRes.error.message)
    else setProfile(pRes.data)
    if (cRes.error) setError(cRes.error.message)
    else setContacts(cRes.data ?? [])
    setLoading(false)
  }, [user, demoMode])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const supportContacts = contacts.filter((c) => c.role !== 'therapist')
  const therapist = contacts.find((c) => c.role === 'therapist') ?? null
  const onboardingComplete =
    supportContacts.filter((c) =>
      ['support_1', 'support_2'].includes(c.role),
    ).length >= 2

  return {
    profile,
    contacts,
    supportContacts,
    therapist,
    onboardingComplete,
    loading,
    error,
    refresh,
  }
}
