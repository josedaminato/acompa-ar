import type { User } from '@supabase/supabase-js'
import type { Database } from '../types/database'

export const DEMO_USER_ID = '00000000-0000-4000-8000-000000000001'
const SESSION_FLAG = 'acompanar_demo'
const STORAGE_KEY = 'acompanar_demo_data_v1'

type ProfileRow = Database['public']['Tables']['users_profile']['Row']
type ContactRow = Database['public']['Tables']['support_contacts']['Row']
export type CheckinRow = Database['public']['Tables']['daily_checkins']['Row']
export type RelapseRow = Database['public']['Tables']['relapse_logs']['Row']

export type DemoBundle = {
  profile: ProfileRow | null
  contacts: ContactRow[]
  checkins: CheckinRow[]
  relapses: RelapseRow[]
}

export const DEMO_USER = {
  id: DEMO_USER_ID,
  aud: 'authenticated',
  role: 'authenticated',
  email: 'vista-previa@local.demo',
  email_confirmed_at: new Date().toISOString(),
  phone: '',
  confirmed_at: new Date().toISOString(),
  last_sign_in_at: new Date().toISOString(),
  app_metadata: {},
  user_metadata: { full_name: 'Vista previa' },
  identities: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  is_anonymous: false,
} as unknown as User

export function isDemoSessionActive(): boolean {
  if (typeof sessionStorage === 'undefined') return false
  return sessionStorage.getItem(SESSION_FLAG) === '1'
}

export function setDemoSessionActive(): void {
  sessionStorage.setItem(SESSION_FLAG, '1')
}

export function clearDemoSession(): void {
  sessionStorage.removeItem(SESSION_FLAG)
}

function defaultBundle(): DemoBundle {
  const now = new Date().toISOString()
  return {
    profile: {
      id: 'demo-profile',
      user_id: DEMO_USER_ID,
      name: 'Vista previa',
      crisis_message:
        'Estoy pasando un momento difícil y necesito hablar con alguien. ¿Podés responderme?',
      created_at: now,
    },
    contacts: [
      {
        id: 'demo-c1',
        user_id: DEMO_USER_ID,
        name: 'María (ejemplo)',
        phone: '5491100000001',
        role: 'support_1',
        created_at: now,
      },
      {
        id: 'demo-c2',
        user_id: DEMO_USER_ID,
        name: 'Lucas (ejemplo)',
        phone: '5491100000002',
        role: 'support_2',
        created_at: now,
      },
    ],
    checkins: [],
    relapses: [],
  }
}

export function loadDemoBundle(): DemoBundle {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultBundle()
    const parsed = JSON.parse(raw) as DemoBundle
    if (!parsed.profile || !Array.isArray(parsed.contacts)) return defaultBundle()
    return {
      profile: parsed.profile,
      contacts: parsed.contacts,
      checkins: parsed.checkins ?? [],
      relapses: parsed.relapses ?? [],
    }
  } catch {
    return defaultBundle()
  }
}

export function saveDemoBundle(bundle: DemoBundle): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bundle))
}

export function replaceDemoProfileAndContacts(
  profile: ProfileRow,
  contacts: ContactRow[],
): void {
  const b = loadDemoBundle()
  saveDemoBundle({ ...b, profile, contacts })
}

export function appendDemoCheckin(
  row: Omit<CheckinRow, 'id' | 'created_at'> & Partial<Pick<CheckinRow, 'id' | 'created_at'>>,
): void {
  const b = loadDemoBundle()
  const id = row.id ?? crypto.randomUUID()
  const created_at = row.created_at ?? new Date().toISOString()
  const full: CheckinRow = {
    ...row,
    id,
    created_at,
    user_id: DEMO_USER_ID,
  } as CheckinRow
  saveDemoBundle({ ...b, checkins: [full, ...b.checkins] })
}

export function appendDemoRelapse(
  row: Omit<RelapseRow, 'id' | 'created_at'> & Partial<Pick<RelapseRow, 'id' | 'created_at'>>,
): void {
  const b = loadDemoBundle()
  const id = row.id ?? crypto.randomUUID()
  const created_at = row.created_at ?? new Date().toISOString()
  const full: RelapseRow = {
    ...row,
    id,
    created_at,
    user_id: DEMO_USER_ID,
  } as RelapseRow
  saveDemoBundle({ ...b, relapses: [full, ...b.relapses] })
}

export function resetDemoLocalData(): void {
  localStorage.removeItem(STORAGE_KEY)
}
