import type { PostgrestError } from '@supabase/supabase-js'
import type { PlutoSupabase } from '../supabase'
import type { OutboxTable, PulledTable } from '../db'
import type { ReadResult, SyncBackend, WriteResult } from './backend'

type Response = { error: PostgrestError | null; status: number }

/** Offline, timeouts, rate limits, server errors and expired tokens are worth retrying. */
export function isTransient(status: number): boolean {
  return status === 0 || status === 401 || status === 408 || status === 429 || status >= 500
}

function toWrite({ error, status }: Response): WriteResult {
  if (!error) return { ok: true }
  return { ok: false, transient: isTransient(status), message: error.message }
}

function toRead<T>(res: Response & { data: T[] | null }): ReadResult<T> {
  if (res.error)
    return { ok: false, transient: isTransient(res.status), message: res.error.message }
  return { ok: true, rows: res.data ?? [] }
}

const PAGE = 1000

/** Supabase implementation of the sync backend. RLS scopes every query to the signed-in user. */
export function supabaseBackend(sb: PlutoSupabase): SyncBackend {
  // The typed client needs literal table names; the engine works with a union, so widen here once.
  const from = (table: OutboxTable | 'sync_tombstones') => sb.from(table as 'body_vitals')

  return {
    async upsert(table, row) {
      return toWrite(await from(table).upsert(row as never))
    },
    async patch(table, id, values) {
      return toWrite(
        await from(table)
          .update(values as never)
          .eq('id', id),
      )
    },
    async remove(table, id) {
      return toWrite(await from(table).delete().eq('id', id))
    },
    async fetchChanged(table: PulledTable, since) {
      let q = from(table).select('*').order('updated_at').limit(PAGE)
      if (since) q = q.gte('updated_at', since)
      return toRead(await q)
    },
    async fetchTombstones(since) {
      let q = sb.from('sync_tombstones').select('table_name, row_id, deleted_at').limit(PAGE)
      if (since) q = q.gte('deleted_at', since)
      return toRead(await q)
    },
    async fetchProfile(userId) {
      return toRead(await sb.from('profiles').select('*').eq('id', userId))
    },
  }
}
