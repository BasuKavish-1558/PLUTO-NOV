import type { Session } from '@supabase/supabase-js'
import { create } from 'zustand'

type AuthState = {
  status: 'loading' | 'signed-out' | 'signed-in'
  session: Session | null
  /** Set when the user arrived from a password-reset email. */
  recovering: boolean
}

export const useAuthStore = create<AuthState>(() => ({
  status: 'loading',
  session: null,
  recovering: false,
}))

/** The signed-in user's id. Only call where a route guard guarantees a session. */
export function useUserId(): string {
  const id = useAuthStore((s) => s.session?.user.id)
  if (!id) throw new Error('useUserId() called without a session')
  return id
}

export function currentUserId(): string {
  const id = useAuthStore.getState().session?.user.id
  if (!id) throw new Error('No signed-in user')
  return id
}
