export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users_profile: {
        Row: {
          id: string
          user_id: string
          name: string
          crisis_message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          crisis_message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          crisis_message?: string | null
          created_at?: string
        }
      }
      support_contacts: {
        Row: {
          id: string
          user_id: string
          name: string
          phone: string
          role: 'support_1' | 'support_2' | 'support_3' | 'therapist'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          phone: string
          role: 'support_1' | 'support_2' | 'support_3' | 'therapist'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          phone?: string
          role?: 'support_1' | 'support_2' | 'support_3' | 'therapist'
          created_at?: string
        }
      }
      daily_checkins: {
        Row: {
          id: string
          user_id: string
          mood: string
          context: string | null
          craving_intensity: number | null
          consumed: boolean
          had_urge: boolean
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          mood: string
          context?: string | null
          craving_intensity?: number | null
          consumed?: boolean
          had_urge?: boolean
          note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          mood?: string
          context?: string | null
          craving_intensity?: number | null
          consumed?: boolean
          had_urge?: boolean
          note?: string | null
          created_at?: string
        }
      }
      relapse_logs: {
        Row: {
          id: string
          user_id: string
          location: string | null
          people_context: string | null
          emotion_before: string | null
          trigger: string | null
          next_action: string | null
          notified_someone: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          location?: string | null
          people_context?: string | null
          emotion_before?: string | null
          trigger?: string | null
          next_action?: string | null
          notified_someone?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          location?: string | null
          people_context?: string | null
          emotion_before?: string | null
          trigger?: string | null
          next_action?: string | null
          notified_someone?: boolean
          created_at?: string
        }
      }
    }
  }
}

export type Mood =
  | 'tranquil'
  | 'anxious'
  | 'lonely'
  | 'craving'
  | 'others_using'
  | 'consumed'

export type SituationContext =
  | 'alone'
  | 'good_company'
  | 'people_using'
  | 'home'
  | 'street'
  | 'outing'
