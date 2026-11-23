import { describe, expect, it } from 'vitest'
import { parseThemePref, resolveTheme, toggledTheme } from './theme'

describe('theme', () => {
  it('parses stored values and falls back to system', () => {
    expect(parseThemePref('dark')).toBe('dark')
    expect(parseThemePref('light')).toBe('light')
    expect(parseThemePref('nope')).toBe('system')
    expect(parseThemePref(null)).toBe('system')
  })

  it('resolves system against the OS preference', () => {
    expect(resolveTheme('system', true)).toBe('dark')
    expect(resolveTheme('system', false)).toBe('light')
    expect(resolveTheme('light', true)).toBe('light')
    expect(resolveTheme('dark', false)).toBe('dark')
  })

  it('toggles to the opposite of what is showing', () => {
    expect(toggledTheme('dark')).toBe('light')
    expect(toggledTheme('light')).toBe('dark')
  })
})
