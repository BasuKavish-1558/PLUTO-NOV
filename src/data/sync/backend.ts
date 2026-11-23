import type { OutboxTable, PulledTable } from '../db'

export type WriteResult = { ok: true } | { ok: false; transient: boolean; message: string }
export type ReadResult<T> =
  { ok: true; rows: T[] } | { ok: false; transient: boolean; message: string }

/** What the sync engine needs from the server. Supabase implements it; tests use a fake. */
export interface SyncBackend {
  upsert(table: OutboxTable, row: Record<string, unknown>): Promise<WriteResult>
  patch(table: OutboxTable, id: string, values: Record<string, unknown>): Promise<WriteResult>
  remove(table: OutboxTable, id: string): Promise<WriteResult>
  /** Rows of the signed-in user with updated_at >= since (all rows when since is null). */
  fetchChanged(table: PulledTable, since: string | null): Promise<ReadResult<unknown>>
  fetchTombstones(since: string | null): Promise<ReadResult<unknown>>
  fetchProfile(userId: string): Promise<ReadResult<unknown>>
}
