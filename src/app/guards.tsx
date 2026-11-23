import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router'
import { Splash } from '@/components/Splash'
import { Button } from '@/components/ui/button'
import { profileQuery } from '@/data/repos/profile'
import { syncNow } from '@/data/sync/engine'
import { useSyncStore } from '@/data/sync/sync-store'
import { useLiveQuery } from '@/data/use-live-query'
import { useAuthStore, useUserId } from '@/features/auth/auth-store'
import { signOut } from '@/features/auth/session'
import { ProfileContext, useProfile } from '@/features/profile/profile-context'
import { useThemeStore } from '@/features/theme/theme-store'

/** Screens that need a session. */
export function RequireAuth() {
  const status = useAuthStore((s) => s.status)
  const recovering = useAuthStore((s) => s.recovering)
  const location = useLocation()
  if (status === 'loading') return <Splash />
  if (status === 'signed-out') return <Navigate to="/auth" replace state={{ from: location }} />
  if (recovering) return <Navigate to="/auth/update-password" replace />
  return <Outlet />
}

/** Sign-in screens: a signed-in user goes straight to the app. */
export function RedirectIfSignedIn() {
  const status = useAuthStore((s) => s.status)
  if (status === 'loading') return <Splash />
  if (status === 'signed-in') return <Navigate to="/" replace />
  return <Outlet />
}

/**
 * Loads the profile from Dexie (filled by the first sync after sign-in) and
 * provides it to everything below. Works offline once it has been loaded once.
 */
export function ProfileGate() {
  const userId = useUserId()
  const { data: profile, isLoading } = useLiveQuery(profileQuery(userId), [userId])
  const sync = useSyncStore()

  if (profile) {
    return (
      <ProfileContext.Provider value={profile}>
        <ThemeFromProfile />
        <Outlet />
      </ProfileContext.Provider>
    )
  }
  if (
    isLoading ||
    (!sync.initialPullDone && sync.status !== 'offline' && sync.status !== 'error')
  ) {
    return <Splash />
  }
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="max-w-xs">
        {sync.status === 'offline'
          ? 'You’re offline. Connect once so Pluto can load your profile; after that it works offline.'
          : 'We couldn’t load your profile.'}
      </p>
      <div className="flex gap-2">
        <Button onClick={() => void syncNow()}>Try again</Button>
        <Button variant="ghost" onClick={() => void signOut()}>
          Sign out
        </Button>
      </div>
    </div>
  )
}

/** Applies theme_pref from the profile (e.g. set on another device) once onboarding is done. */
function ThemeFromProfile() {
  const { theme_pref, onboarded_at } = useProfile()
  useEffect(() => {
    if (onboarded_at && useThemeStore.getState().pref !== theme_pref) {
      useThemeStore.getState().setPref(theme_pref)
    }
  }, [theme_pref, onboarded_at])
  return null
}

export function RequireOnboarded() {
  const { onboarded_at } = useProfile()
  return onboarded_at ? <Outlet /> : <Navigate to="/onboarding" replace />
}

export function OnlyBeforeOnboarding() {
  const { onboarded_at } = useProfile()
  return onboarded_at ? <Navigate to="/" replace /> : <Outlet />
}
