import { db } from '../db'
import { getSupabase } from '../supabase'
import { supabaseBackend } from './supabase-backend'
import { useSyncStore } from './sync-store'
import { pull, push } from './sync'

let userId: string | null = null
let running: Promise<void> | null = null
let rerun = false
let debounce: ReturnType<typeof setTimeout> | undefined
let interval: ReturnType<typeof setInterval> | undefined

async function refreshCounts() {
  const ops = await db.outbox.toArray()
  useSyncStore.setState({
    pending: ops.filter((o) => o.failedAt === null).length,
    failed: ops.filter((o) => o.failedAt !== null).length,
  })
}

async function runOnce() {
  if (!userId) return
  if (!navigator.onLine) {
    useSyncStore.setState({ status: 'offline' })
    await refreshCounts()
    return
  }
  useSyncStore.setState({ status: 'syncing' })
  const backend = supabaseBackend(getSupabase())
  try {
    const pushed = await push(db, backend)
    const pulled = await pull(db, backend, userId)
    const offline = pushed.stoppedOffline || (!pulled.ok && pulled.transient)
    useSyncStore.setState({
      status: offline ? 'offline' : pulled.ok ? 'idle' : 'error',
      ...(pulled.ok && { lastSyncedAt: new Date().toISOString(), initialPullDone: true }),
    })
  } catch (error) {
    console.error('[sync]', error)
    useSyncStore.setState({ status: 'error' })
  }
  await refreshCounts()
}

/** Runs a sync now, or once more after the current run if one is in flight. */
export function syncNow(): Promise<void> {
  if (running) {
    rerun = true
    return running
  }
  running = runOnce().finally(() => {
    running = null
    if (rerun) {
      rerun = false
      void syncNow()
    }
  })
  return running
}

/** Called after local writes: batches bursts of writes into one sync. */
export function requestSync() {
  void refreshCounts()
  clearTimeout(debounce)
  debounce = setTimeout(() => void syncNow(), 400)
}

const onOnline = () => void syncNow()
const onOffline = () => useSyncStore.setState({ status: 'offline' })
const onVisible = () => document.visibilityState === 'visible' && void syncNow()

export function startSync(id: string) {
  if (userId === id) return
  stopSync()
  userId = id
  useSyncStore.setState({ initialPullDone: false })
  window.addEventListener('online', onOnline)
  window.addEventListener('offline', onOffline)
  document.addEventListener('visibilitychange', onVisible)
  interval = setInterval(() => void syncNow(), 60_000)
  void syncNow()
}

export function stopSync() {
  userId = null
  clearTimeout(debounce)
  clearInterval(interval)
  window.removeEventListener('online', onOnline)
  window.removeEventListener('offline', onOffline)
  document.removeEventListener('visibilitychange', onVisible)
  useSyncStore.setState({ status: 'idle', pending: 0, failed: 0, initialPullDone: false })
}
