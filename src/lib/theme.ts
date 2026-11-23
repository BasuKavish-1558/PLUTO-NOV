export type ThemePref = 'system' | 'light' | 'dark'
export type ResolvedTheme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'pluto.theme'
const PREFS: readonly ThemePref[] = ['system', 'light', 'dark']

export function parseThemePref(value: unknown): ThemePref {
  return PREFS.includes(value as ThemePref) ? (value as ThemePref) : 'system'
}

export function resolveTheme(pref: ThemePref, systemPrefersDark: boolean): ResolvedTheme {
  if (pref === 'system') return systemPrefersDark ? 'dark' : 'light'
  return pref
}

/** The manual toggle flips whatever is showing now to the other theme. */
export function toggledTheme(current: ResolvedTheme): ThemePref {
  return current === 'dark' ? 'light' : 'dark'
}
