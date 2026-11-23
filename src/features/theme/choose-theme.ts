import { updateProfile } from '@/data/repos/profile'
import { useAuthStore } from '@/features/auth/auth-store'
import type { ThemePref } from '@/lib/theme'
import { useThemeStore } from './theme-store'

/** Applies a theme now and, when signed in, saves it to profiles.theme_pref. */
export function chooseTheme(pref: ThemePref) {
  useThemeStore.getState().setPref(pref)
  if (useAuthStore.getState().status === 'signed-in') void updateProfile({ theme_pref: pref })
}
