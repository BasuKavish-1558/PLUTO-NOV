import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { readEnv } from '@/lib/env'
import type { Database } from './database.types'

export type PlutoSupabase = SupabaseClient<Database>

let client: PlutoSupabase | null = null

export function isSupabaseConfigured(): boolean {
  return readEnv() !== null
}

/**
 * The single Supabase client. Sessions persist in localStorage and refresh
 * automatically, so the user stays signed in until they sign out (P-1).
 */
export function getSupabase(): PlutoSupabase {
  if (client) return client
  const env = readEnv()
  if (!env) {
    throw new Error(
      'Supabase is not configured. Copy .env.example to .env.local and set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
    )
  }
  client = createClient<Database>(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  })
  return client
}
