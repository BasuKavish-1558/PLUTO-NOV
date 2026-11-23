import { currentUserId } from '@/features/auth/auth-store'
import { db } from '../db'
import type { ProfilePatch } from '../models'
import { requestSync } from '../sync/engine'
import { enqueue } from '../sync/outbox'

/** Updates the local profile at once and queues the change for the server. */
export async function updateProfile(patch: ProfilePatch) {
  const id = currentUserId()
  await db.transaction('rw', db.profiles, db.outbox, async () => {
    await db.profiles.update(id, patch)
    await enqueue(db, { table: 'profiles', op: 'patch', rowId: id, payload: patch })
  })
  requestSync()
}

export function profileQuery(userId: string) {
  return () => db.profiles.get(userId)
}
