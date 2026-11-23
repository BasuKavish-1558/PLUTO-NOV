/** Shown when .env.local is missing: the app can't do anything without Supabase. */
export function SetupScreen() {
  return (
    <div className="flex min-h-dvh items-center justify-center p-6">
      <div className="max-w-md space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Connect Supabase</h1>
        <p className="text-muted-foreground">
          Pluto needs a Supabase project. Copy <code>.env.example</code> to <code>.env.local</code>,
          set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>, then restart
          the dev server. The README has the full steps.
        </p>
      </div>
    </div>
  )
}
