import 'fake-indexeddb/auto'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { PlutoDB, type OutboxTable, type PulledTable } from '../db'
import type { BodyVital } from '../models'
import type { ReadResult, SyncBackend, WriteResult } from './backend'
import { enqueue } from './outbox'
import { pull, push } from './sync'

const USER = 'user-1'

const profileRow = {
  id: USER,
  display_name: 'Sam',
  avatar_path: null,
  age: 30,
  weight_unit: 'kg',
  height_unit: 'cm',
  theme_pref: 'system',
  show_bmi: false,
  onboarded_at: '2026-11-23T10:00:00Z',
  created_at: '2026-11-23T10:00:00Z',
  updated_at: '2026-11-23T10:00:00Z',
}

const vital = (id: string, updated_at: string, weight_kg = 80): BodyVital => ({
  id,
  user_id: USER,
  measured_on: '2026-11-23',
  weight_kg,
  height_cm: null,
  created_at: updated_at,
  updated_at,
})

/** In-memory server with scripted failures. */
class FakeBackend implements SyncBackend {
  rows = new Map<string, Record<string, unknown>>()
  tombstones: { table_name: string; row_id: string; deleted_at: string }[] = []
  profile: Record<string, unknown> | null = profileRow
  calls: string[] = []
  failNext: WriteResult | null = null
  lastSince: Record<string, string | null> = {}

  private write(desc: string, apply: () => void): Promise<WriteResult> {
    this.calls.push(desc)
    if (this.failNext) {
      const f = this.failNext
      this.failNext = null
      return Promise.resolve(f)
    }
    apply()
    return Promise.resolve({ ok: true })
  }
  upsert(table: OutboxTable, row: Record<string, unknown>) {
    return this.write(`upsert ${table} ${String(row.id)}`, () =>
      this.rows.set(String(row.id), { ...row }),
    )
  }
  patch(table: OutboxTable, id: string, values: Record<string, unknown>) {
    return this.write(`patch ${table} ${id}`, () => {
      if (table === 'profiles') this.profile = { ...this.profile, ...values }
    })
  }
  remove(table: OutboxTable, id: string) {
    return this.write(`delete ${table} ${id}`, () => this.rows.delete(id))
  }
  fetchChanged(_table: PulledTable, since: string | null): Promise<ReadResult<unknown>> {
    this.lastSince.body_vitals = since
    const rows = [...this.rows.values()].filter((r) => !since || String(r.updated_at) >= since)
    return Promise.resolve({ ok: true, rows })
  }
  fetchTombstones(since: string | null): Promise<ReadResult<unknown>> {
    return Promise.resolve({
      ok: true,
      rows: this.tombstones.filter((t) => !since || t.deleted_at >= since),
    })
  }
  fetchProfile(): Promise<ReadResult<unknown>> {
    return Promise.resolve({ ok: true, rows: this.profile ? [this.profile] : [] })
  }
}

let db: PlutoDB
let backend: FakeBackend

beforeEach(async () => {
  db = new PlutoDB(`test-${crypto.randomUUID()}`)
  await db.open()
  backend = new FakeBackend()
})

afterEach(async () => {
  await db.delete()
})

describe('push', () => {
  it('replays the outbox in order and empties it', async () => {
    await enqueue(db, { table: 'body_vitals', op: 'upsert', rowId: 'a', payload: { id: 'a' } })
    await enqueue(db, { table: 'profiles', op: 'patch', rowId: USER, payload: { age: 31 } })
    await enqueue(db, { table: 'body_vitals', op: 'delete', rowId: 'a', payload: null })

    const result = await push(db, backend)

    expect(result).toEqual({ pushed: 3, failed: 0, stoppedOffline: false })
    expect(backend.calls).toEqual([
      'upsert body_vitals a',
      `patch profiles ${USER}`,
      'delete body_vitals a',
    ])
    expect(await db.outbox.count()).toBe(0)
  })

  it('stops on a transient error and keeps the op for the next run', async () => {
    await enqueue(db, { table: 'body_vitals', op: 'upsert', rowId: 'a', payload: { id: 'a' } })
    await enqueue(db, { table: 'body_vitals', op: 'upsert', rowId: 'b', payload: { id: 'b' } })
    backend.failNext = { ok: false, transient: true, message: 'Failed to fetch' }

    const first = await push(db, backend)
    expect(first.stoppedOffline).toBe(true)
    expect(backend.calls).toEqual(['upsert body_vitals a'])
    const kept = await db.outbox.toArray()
    expect(kept).toHaveLength(2)
    expect(kept[0]).toMatchObject({ attempts: 1, lastError: 'Failed to fetch', failedAt: null })

    const second = await push(db, backend)
    expect(second).toEqual({ pushed: 2, failed: 0, stoppedOffline: false })
  })

  it('parks a permanently rejected op and continues with the rest', async () => {
    await enqueue(db, { table: 'body_vitals', op: 'upsert', rowId: 'bad', payload: { id: 'bad' } })
    await enqueue(db, { table: 'body_vitals', op: 'upsert', rowId: 'ok', payload: { id: 'ok' } })
    backend.failNext = { ok: false, transient: false, message: 'violates check constraint' }

    const result = await push(db, backend)

    expect(result).toEqual({ pushed: 1, failed: 1, stoppedOffline: false })
    const parked = await db.outbox.toArray()
    expect(parked).toHaveLength(1)
    expect(parked[0]?.failedAt).not.toBeNull()
    // A later run doesn't retry it.
    backend.calls = []
    await push(db, backend)
    expect(backend.calls).toEqual([])
  })
})

describe('pull', () => {
  it('stores the profile and changed rows, then advances the cursor', async () => {
    backend.rows.set('a', vital('a', '2026-11-23T10:00:00.000Z'))
    backend.rows.set('b', vital('b', '2026-11-23T11:00:00.000Z', 81))

    expect((await pull(db, backend, USER)).ok).toBe(true)

    expect(await db.profiles.get(USER)).toMatchObject({ display_name: 'Sam', weight_unit: 'kg' })
    expect((await db.body_vitals.toArray()).map((r) => r.id).sort()).toEqual(['a', 'b'])
    expect(backend.lastSince.body_vitals).toBeNull()

    await pull(db, backend, USER)
    // Second pull asks from the newest updated_at minus a one-minute overlap.
    expect(backend.lastSince.body_vitals).toBe('2026-11-23T10:59:00.000Z')
  })

  it('coerces numeric strings from Postgres into numbers', async () => {
    backend.rows.set('a', { ...vital('a', '2026-11-23T10:00:00.000Z'), weight_kg: '80.400' })
    await pull(db, backend, USER)
    expect((await db.body_vitals.get('a'))?.weight_kg).toBe(80.4)
  })

  it('never overwrites a row that has an unsent local write', async () => {
    await db.body_vitals.put(vital('a', '2026-11-23T09:00:00.000Z', 79))
    await enqueue(db, { table: 'body_vitals', op: 'upsert', rowId: 'a', payload: { id: 'a' } })
    backend.rows.set('a', vital('a', '2026-11-23T10:00:00.000Z', 85))

    await pull(db, backend, USER)

    expect((await db.body_vitals.get('a'))?.weight_kg).toBe(79)
  })

  it('applies tombstones from other devices', async () => {
    await db.body_vitals.put(vital('gone', '2026-11-23T09:00:00.000Z'))
    await db.body_vitals.put(vital('kept', '2026-11-23T09:00:00.000Z'))
    backend.tombstones = [
      { table_name: 'body_vitals', row_id: 'gone', deleted_at: '2026-11-23T12:00:00.000Z' },
      { table_name: 'workouts', row_id: 'kept', deleted_at: '2026-11-23T12:00:00.000Z' },
    ]

    await pull(db, backend, USER)

    expect(await db.body_vitals.get('gone')).toBeUndefined()
    expect(await db.body_vitals.get('kept')).toBeDefined()
  })

  it('reports a transient failure without touching local data', async () => {
    await db.body_vitals.put(vital('a', '2026-11-23T09:00:00.000Z'))
    backend.fetchProfile = () =>
      Promise.resolve({ ok: false, transient: true, message: 'Failed to fetch' })

    expect(await pull(db, backend, USER)).toEqual({ ok: false, transient: true })
    expect(await db.body_vitals.count()).toBe(1)
  })
})

describe('clearAll', () => {
  it('wipes rows, cursors and pending writes', async () => {
    await db.body_vitals.put(vital('a', '2026-11-23T09:00:00.000Z'))
    await db.meta.put({ key: 'pull:body_vitals', value: 'x' })
    await enqueue(db, { table: 'body_vitals', op: 'delete', rowId: 'a', payload: null })

    await db.clearAll()

    expect(await db.body_vitals.count()).toBe(0)
    expect(await db.meta.count()).toBe(0)
    expect(await db.outbox.count()).toBe(0)
  })
})
