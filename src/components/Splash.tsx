/** Full-screen placeholder while the session or profile loads. */
export function Splash({ message }: { message?: string }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
      <span
        className="bg-primary size-10 animate-pulse rounded-full motion-reduce:animate-none"
        aria-hidden
      />
      {message && <p className="text-muted-foreground max-w-xs text-sm">{message}</p>}
      <span className="sr-only">Loading</span>
    </div>
  )
}
