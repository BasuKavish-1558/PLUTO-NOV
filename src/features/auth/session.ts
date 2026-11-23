import { db } from '@/data/db'
import { stopSync, syncNow } from '@/data/sync/engine'
import { getSupabase } from '@/data/supabase'

/** Unsent local changes; signing out discards them, so the UI warns first. */
export async function unsentChangeCount(): Promise<number> {
  await syncNow()
  const ops = await db.outbox.toArray()
  return ops.filter((o) => o.failedAt === null).length
}

/** Signs out on this device and removes the local copy of the user's data. */
export async function signOut() {
  stopSync()
  await getSupabase().auth.signOut({ scope: 'local' })
  await db.clearAll()
}

/** P-5: deletes the account, every row and every stored file, then clears this device. */
export async function deleteAccount(): Promise<{ ok: true } | { ok: false; message: string }> {
  const sb = getSupabase()
  const { error } = await sb.functions.invoke('delete-account', { method: 'POST' })
  if (error) {
    return {
      ok: false,
      message: navigator.onLine
        ? 'We couldn’t delete your account. Please try again.'
        : 'You’re offline. Connect to the internet to delete your account.',
    }
  }
  stopSync()
  await sb.auth.signOut({ scope: 'local' })
  await db.clearAll()
  return { ok: true }
}

/** Friendlier wording for the Supabase Auth errors people actually hit. */
export function authErrorMessage(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('invalid login credentials')) return 'That email and password don’t match.'
  if (m.includes('already registered') || m.includes('already exists'))
    return 'An account with this email already exists. Try signing in.'
  if (m.includes('email not confirmed'))
    return 'Please confirm your email first. Check your inbox for the link.'
  if (m.includes('rate limit') || m.includes('too many'))
    return 'Too many attempts. Wait a minute and try again.'
  if (m.includes('failed to fetch') || m.includes('network'))
    return 'Can’t reach the server. Check your connection and try again.'
  if (m.includes('password')) return message
  return 'Something went wrong. Please try again.'
}
