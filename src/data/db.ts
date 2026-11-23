import { Dexie, type EntityTable } from 'dexie'
import type { BodyVital, Profile } from './models'

/**
 * Local-first store (architecture rule 5). Every user write lands here first,
 * together with an outbox entry, inside one transaction. New tables are added
 * in a new db.version(); existing versions are never edited.
 */

/** Tables whose rows the sync engine pulls down by updated_at. */
export const PULLED_TABLES = ['body_vitals'] as const
export type PulledTable = (typeof PULLED_TABLES)[number]

/** Every table the outbox can write to. Later phases extend this list. */
export type OutboxTable = PulledTable | 'profiles' | 'events'

/**
 * One pending write, replayed in order once online. Row ids are client UUIDs,
 * so replaying an upsert twice is harmless.
 * - upsert: insert-or-update the full row
 * - patch:  update some columns of an existing row (profiles, which users can't insert)
 * - delete: delete by id
 */
export type OutboxOp = {
  seq?: number
  table: OutboxTable
  op: 'upsert' | 'patch' | 'delete'
  rowId: string
  payload: Record<string, unknown> | null
  createdAt: string
  attempts: number
  lastError: string | null
  /** Set when the server rejected the write for good; it stays for inspection and is skipped. */
  failedAt: string | null
}

/** Small key-value store for sync cursors and similar bookkeeping. */
export type MetaEntry = { key: string; value: unknown }

export class PlutoDB extends Dexie {
  outbox!: EntityTable<OutboxOp, 'seq'>
  meta!: EntityTable<MetaEntry, 'key'>
  profiles!: EntityTable<Profile, 'id'>
  body_vitals!: EntityTable<BodyVital, 'id'>

  constructor(name = 'pluto') {
    super(name)
    this.version(1).stores({
      outbox: '++seq, table, rowId',
      meta: 'key',
    })
    this.version(2).stores({
      profiles: 'id',
      body_vitals: 'id, measured_on, updated_at',
    })
  }

  /** Removes every user row and pending write (sign out, account deletion). */
  async clearAll() {
    await this.transaction('rw', this.tables, async () => {
      await Promise.all(this.tables.map((t) => t.clear()))
    })
  }
}

export const db = new PlutoDB()
