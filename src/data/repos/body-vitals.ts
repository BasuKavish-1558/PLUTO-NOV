import type { LocalDate } from '@/domain/local-date'
import { currentUserId } from '@/features/auth/auth-store'
import { db } from '../db'
import type { BodyVital } from '../models'
import { requestSync } from '../sync/engine'
import { enqueue } from '../sync/outbox'

/** Adds a dated entry (BV-2: never overwrites earlier ones). */
export async function addBodyVital(input: {
  measuredOn: LocalDate
  weightKg?: number | null
  heightCm?: number | null
}) {
  const now = new Date().toISOString()
  const row: BodyVital = {
    id: crypto.randomUUID(),
    user_id: currentUserId(),
    measured_on: input.measuredOn,
    weight_kg: input.weightKg ?? null,
    height_cm: input.heightCm ?? null,
    created_at: now,
    updated_at: now,
  }
  // updated_at is set by the server; everything else goes up as written.
  const { id, user_id, measured_on, weight_kg, height_cm, created_at } = row
  const payload = { id, user_id, measured_on, weight_kg, height_cm, created_at }
  await db.transaction('rw', db.body_vitals, db.outbox, async () => {
    await db.body_vitals.put(row)
    await enqueue(db, { table: 'body_vitals', op: 'upsert', rowId: row.id, payload })
  })
  requestSync()
  return row
}

export async function deleteBodyVital(id: string) {
  await db.transaction('rw', db.body_vitals, db.outbox, async () => {
    await db.body_vitals.delete(id)
    await enqueue(db, { table: 'body_vitals', op: 'delete', rowId: id, payload: null })
  })
  requestSync()
}

export function bodyVitalsQuery(userId: string) {
  return () => db.body_vitals.filter((v) => v.user_id === userId).toArray()
}
