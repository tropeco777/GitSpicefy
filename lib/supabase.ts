import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDA5OTUyMDAsImV4cCI6MTk1NjU3MTIwMH0.placeholder'

export const supabase = supabaseUrl.includes('placeholder')
  ? null
  : createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Profile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  github_username?: string
  created_at: string
  updated_at: string
}

export interface GeneratedDoc {
  id: string
  user_id: string
  repository_url: string
  repository_name: string
  generated_content: string
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  plan: 'free' | 'starter' | 'monthly' | 'lifetime'
  generations_used: number
  generations_limit: number
  has_advanced_features: boolean
  expires_at?: string
  created_at: string
  updated_at: string
}
