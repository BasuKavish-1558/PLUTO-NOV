import type { OutboxOp, PlutoDB } from '../db'

type NewOp = Pick<OutboxOp, 'table' | 'op' | 'rowId' | 'payload'>

/** Adds a write to the outbox. Call inside the same Dexie transaction as the local write. */
export function enqueue(db: PlutoDB, op: NewOp) {
  return db.outbox.add({
    ...op,
    createdAt: new Date().toISOString(),
    attempts: 0,
    lastError: null,
    failedAt: null,
  })
}

export async function pendingOps(db: PlutoDB): Promise<OutboxOp[]> {
  const all = await db.outbox.orderBy('seq').toArray()
  return all.filter((op) => op.failedAt === null)
}

/** Row ids with unsent writes for a table: pull must not overwrite them. */
export async function pendingRowIds(db: PlutoDB, table: OutboxOp['table']): Promise<Set<string>> {
  const ops = await db.outbox.where('table').equals(table).toArray()
  return new Set(ops.filter((op) => op.failedAt === null).map((op) => op.rowId))
}
