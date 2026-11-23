import { currentUserId } from '@/features/auth/auth-store'
import { compressImage, extensionFor } from '@/lib/image-compress'
import { getSupabase } from '../supabase'
import { updateProfile } from './profile'

export const MEDIA_BUCKET = 'user-media'

/**
 * P-3: compresses the picked photo to a 512 px square, uploads it to the private
 * bucket under {uid}/avatar/, points the profile at it and removes the old file.
 * Needs a connection (photos aren't queued offline).
 */
export async function uploadAvatar(file: File, previousPath: string | null) {
  if (!navigator.onLine) throw new Error('You’re offline. Connect to change your photo.')
  const blob = await compressImage(file, { maxSize: 512, square: true, quality: 0.85 })
  const path = `${currentUserId()}/avatar/${crypto.randomUUID()}.${extensionFor(blob)}`
  const storage = getSupabase().storage.from(MEDIA_BUCKET)
  const { error } = await storage.upload(path, blob, { contentType: blob.type, upsert: false })
  if (error) throw new Error('Upload failed. Please try again.')
  await updateProfile({ avatar_path: path })
  if (previousPath) void storage.remove([previousPath])
  return path
}

export async function removeAvatar(path: string) {
  await updateProfile({ avatar_path: null })
  void getSupabase().storage.from(MEDIA_BUCKET).remove([path])
}

/** Short-lived signed URL; the bucket is private. */
export async function signedAvatarUrl(path: string): Promise<string> {
  const { data, error } = await getSupabase()
    .storage.from(MEDIA_BUCKET)
    .createSignedUrl(path, 60 * 60)
  if (error || !data) throw error ?? new Error('No URL')
  return data.signedUrl
}
