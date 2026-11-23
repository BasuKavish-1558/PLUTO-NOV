import { useQuery } from '@tanstack/react-query'
import { CircleUser } from 'lucide-react'
import { signedAvatarUrl } from '@/data/repos/avatar'
import { cn } from '@/lib/utils'

function initials(name: string | null) {
  if (!name) return null
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('') || null
}

/** Profile photo from the private bucket (signed URL), falling back to initials. */
export function Avatar({
  path,
  name,
  className,
}: {
  path: string | null
  name: string | null
  className?: string
}) {
  const { data: url } = useQuery({
    queryKey: ['avatar-url', path],
    queryFn: () => signedAvatarUrl(path!),
    enabled: !!path,
    staleTime: 50 * 60 * 1000,
    retry: false,
  })
  const letters = initials(name)

  return (
    <span
      className={cn(
        'bg-muted text-muted-foreground relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold select-none',
        className,
      )}
    >
      {url ? (
        <img src={url} alt="" className="size-full object-cover" draggable={false} />
      ) : letters ? (
        <span aria-hidden>{letters}</span>
      ) : (
        <CircleUser className="size-3/5" aria-hidden />
      )}
    </span>
  )
}
