import { useRef, useState } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import { uploadAvatar } from '@/data/repos/avatar'
import { Avatar } from './Avatar'

/**
 * Tap the photo to pick one. accept="image/*" without `capture` lets phones
 * offer both the camera and the gallery (P-3).
 */
export function AvatarPicker({
  path,
  name,
  size = 'size-24',
}: {
  path: string | null
  name: string | null
  size?: string
}) {
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onPick(file: File | undefined) {
    if (!file) return
    setBusy(true)
    setError(null)
    try {
      await uploadAvatar(file, path)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed.')
    } finally {
      setBusy(false)
      if (input.current) input.current.value = ''
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => input.current?.click()}
        disabled={busy}
        className="group relative rounded-full transition-transform duration-150 active:scale-95 motion-reduce:active:scale-100"
        aria-label={path ? 'Change profile photo' : 'Add profile photo'}
      >
        <Avatar path={path} name={name} className={`${size} text-2xl`} />
        <span className="bg-primary text-primary-foreground ring-background absolute right-0 bottom-0 flex size-8 items-center justify-center rounded-full ring-2">
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
        </span>
      </button>
      <input
        ref={input}
        type="file"
        accept="image/*"
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => void onPick(e.target.files?.[0])}
      />
      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}
    </div>
  )
}
