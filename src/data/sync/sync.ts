import type { PlutoDB, PulledTable } from '../db'
import { PULLED_TABLES } from '../db'
import { bodyVitalSchema, profileSchema, tombstoneSchema } from '../models'
import type { SyncBackend } from './backend'
import { pendingOps, pendingRowIds } from './outbox'

export type PushOutcome = { pushed: number; failed: number; stoppedOffline: boolean }

/**
 * Replays the outbox in order. A transient error (offline, 5xx, expired token)
 * stops the run so order is kept; a permanent rejection marks that op failed
 * and moves on, so one bad write can't block everything behind it.
 */
export async function push(db: PlutoDB, backend: SyncBackend): Promise<PushOutcome> {
  let pushed = 0
  let failed = 0
  for (const op of await pendingOps(db)) {
    const result =
      op.op === 'upsert'
        ? await backend.upsert(op.table, op.payload ?? {})
        : op.op === 'patch'
          ? await backend.patch(op.table, op.rowId, op.payload ?? {})
          : await backend.remove(op.table, op.rowId)

    if (result.ok) {
      await db.outbox.delete(op.seq!)
      pushed++
    } else if (result.transient) {
      await db.outbox.update(op.seq!, { attempts: op.attempts + 1, lastError: result.message })
      return { pushed, failed, stoppedOffline: true }
    } else {
      await db.outbox.update(op.seq!, {
        attempts: op.attempts + 1,
        lastError: result.message,
        failedAt: new Date().toISOString(),
      })
      failed++
    }
  }
  return { pushed, failed, stoppedOffline: false }
}

/** Re-read a little before the last cursor: rows committed late with an earlier updated_at still arrive. */
const OVERLAP_MS = 60_000
const cursorKey = (name: string) => `pull:${name}`

function since(cursor: string | undefined): string | null {
  if (!cursor) return null
  return new Date(new Date(cursor).getTime() - OVERLAP_MS).toISOString()
}

async function getCursor(db: PlutoDB, name: string) {
  return (await db.meta.get(cursorKey(name)))?.value as string | undefined
}

async function setCursor(db: PlutoDB, name: string, value: string | undefined) {
  if (value) await db.meta.put({ key: cursorKey(name), value })
}

const maxIso = (values: string[], start?: string) =>
  values.reduce<string | undefined>((max, v) => (!max || v > max ? v : max), start)

const tableSchemas = { body_vitals: bodyVitalSchema } satisfies Record<PulledTable, unknown>

export type PullOutcome = { ok: boolean; transient: boolean }

/** Brings server changes down. Rows with unsent local writes are left alone (local wins until pushed). */
export async function pull(
  db: PlutoDB,
  backend: SyncBackend,
  userId: string,
): Promise<PullOutcome> {
  const profile = await backend.fetchProfile(userId)
  if (!profile.ok) return { ok: false, transient: profile.transient }
  const pendingProfile = await pendingRowIds(db, 'profiles')
  const row = profile.rows[0]
  if (row && !pendingProfile.has(userId)) await db.profiles.put(profileSchema.parse(row))

  for (const table of PULLED_TABLES) {
    const cursor = await getCursor(db, table)
    const result = await backend.fetchChanged(table, since(cursor))
    if (!result.ok) return { ok: false, transient: result.transient }
    const rows = result.rows.map((r) => tableSchemas[table].parse(r))
    const pending = await pendingRowIds(db, table)
    await db.table(table).bulkPut(rows.filter((r) => !pending.has(r.id)))
    await setCursor(
      db,
      table,
      maxIso(
        rows.map((r) => r.updated_at),
        cursor,
      ),
    )
  }

  const tCursor = await getCursor(db, 'tombstones')
  const tombstones = await backend.fetchTombstones(since(tCursor))
  if (!tombstones.ok) return { ok: false, transient: tombstones.transient }
  const parsed = tombstones.rows.map((t) => tombstoneSchema.parse(t))
  for (const table of PULLED_TABLES) {
    const pending = await pendingRowIds(db, table)
    const ids = parsed.filter((t) => t.table_name === table && !pending.has(t.row_id))
    await db.table(table).bulkDelete(ids.map((t) => t.row_id))
  }
  await setCursor(
    db,
    'tombstones',
    maxIso(
      parsed.map((t) => t.deleted_at),
      tCursor,
    ),
  )

  return { ok: true, transient: false }
}
