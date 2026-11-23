import { create } from 'zustand'

export type SyncState = {
  /** 'offline' means writes are queued locally and will go out when the connection is back. */
  status: 'idle' | 'syncing' | 'offline' | 'error'
  pending: number
  failed: number
  lastSyncedAt: string | null
  /** True once the first pull after sign-in has finished (profile is available locally). */
  initialPullDone: boolean
}

export const useSyncStore = create<SyncState>(() => ({
  status: 'idle',
  pending: 0,
  failed: 0,
  lastSyncedAt: null,
  initialPullDone: false,
}))
