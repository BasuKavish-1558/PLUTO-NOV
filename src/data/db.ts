import { Dexie, type EntityTable } from 'dexie'

/**
 * Local-first store. Phase 1 adds one table per synced entity (mirroring the
 * Supabase tables) in a new db.version(); existing versions are never edited.
 */

/** Tables the sync engine pushes to and pulls from Supabase. */
export type SyncedTable =
  | 'body_vitals'
  | 'exercises'
  | 'splits'
  | 'split_days'
  | 'split_day_exercises'
  | 'workouts'
  | 'workout_exercises'
  | 'set_logs'
  | 'personal_records'
  | 'workout_photos'
  | 'nutrition_goals'
  | 'nutrition_entries'
  | 'events'

/** One pending write, replayed in order once online. Row ids are client UUIDs, so replays are idempotent. */
export type OutboxOp = {
  seq?: number
  table: SyncedTable
  op: 'upsert' | 'delete'
  rowId: string
  payload: Record<string, unknown> | null
  createdAt: string
  attempts: number
  lastError: string | null
}

/** Small key-value store for sync cursors and similar bookkeeping. */
export type MetaEntry = { key: string; value: unknown }

export class PlutoDB extends Dexie {
  outbox!: EntityTable<OutboxOp, 'seq'>
  meta!: EntityTable<MetaEntry, 'key'>

  constructor(name = 'pluto') {
    super(name)
    this.version(1).stores({
      outbox: '++seq, table, rowId',
      meta: 'key',
    })
  }
}

export const db = new PlutoDB()
