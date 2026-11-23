import { useSyncExternalStore } from 'react'
import { resolveTheme, type ResolvedTheme } from '@/lib/theme'
import { useThemeStore } from './theme-store'

const query = '(prefers-color-scheme: dark)'

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(query)
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}

export function useResolvedTheme(): ResolvedTheme {
  const pref = useThemeStore((s) => s.pref)
  const systemDark = useSyncExternalStore(subscribe, () => window.matchMedia(query).matches)
  return resolveTheme(pref, systemDark)
}
