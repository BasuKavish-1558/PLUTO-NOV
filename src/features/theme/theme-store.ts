import { create } from 'zustand'
import { parseThemePref, THEME_STORAGE_KEY, type ThemePref } from '@/lib/theme'

function readStored(): ThemePref {
  try {
    return parseThemePref(localStorage.getItem(THEME_STORAGE_KEY))
  } catch {
    return 'system'
  }
}

function writeStored(pref: ThemePref) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, pref)
  } catch {
    // Storage can be unavailable (private mode); the theme still applies for this session.
  }
}

type ThemeState = {
  pref: ThemePref
  setPref: (pref: ThemePref) => void
}

// Phase 1 also writes the preference to profiles.theme_pref once signed in.
export const useThemeStore = create<ThemeState>((set) => ({
  pref: readStored(),
  setPref: (pref) => {
    writeStored(pref)
    set({ pref })
  },
}))
