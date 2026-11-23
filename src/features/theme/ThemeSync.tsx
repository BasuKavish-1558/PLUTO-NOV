import { useEffect } from 'react'
import { useResolvedTheme } from './use-resolved-theme'

/** Applies the resolved theme to <html> and the browser chrome colour. */
export function ThemeSync() {
  const theme = useResolvedTheme()

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    const bg = getComputedStyle(root).getPropertyValue('--background').trim()
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', bg)
  }, [theme])

  return null
}
