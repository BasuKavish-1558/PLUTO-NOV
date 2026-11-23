import { useEffect } from 'react'
import { startSync, stopSync } from '@/data/sync/engine'
import { getSupabase } from '@/data/supabase'
import { useAuthStore } from './auth-store'

/**
 * Mirrors the Supabase session into the auth store and starts or stops sync.
 * The session is persisted by supabase-js, so the user stays signed in (P-1).
 */
export function AuthListener() {
  useEffect(() => {
    const sb = getSupabase()

    void sb.auth.getSession().then(({ data }) => {
      useAuthStore.setState({
        session: data.session,
        status: data.session ? 'signed-in' : 'signed-out',
      })
    })

    // Keep this callback synchronous: awaiting Supabase calls inside it can deadlock the auth client.
    const { data } = sb.auth.onAuthStateChange((event, session) => {
      useAuthStore.setState((s) => ({
        session,
        status: session ? 'signed-in' : 'signed-out',
        recovering: event === 'PASSWORD_RECOVERY' ? true : session ? s.recovering : false,
      }))
    })
    return () => data.subscription.unsubscribe()
  }, [])

  const userId = useAuthStore((s) => s.session?.user.id)
  useEffect(() => {
    if (userId) startSync(userId)
    else stopSync()
  }, [userId])

  return null
}
