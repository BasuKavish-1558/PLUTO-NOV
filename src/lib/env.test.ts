import { describe, expect, it } from 'vitest'
import { readEnv } from './env'

describe('readEnv', () => {
  it('returns the values when both are valid', () => {
    const env = readEnv({
      VITE_SUPABASE_URL: 'https://abc.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'x'.repeat(40),
    })
    expect(env?.VITE_SUPABASE_URL).toBe('https://abc.supabase.co')
  })

  it('returns null when a value is missing or malformed', () => {
    expect(readEnv({})).toBeNull()
    expect(
      readEnv({ VITE_SUPABASE_URL: 'not a url', VITE_SUPABASE_ANON_KEY: 'x'.repeat(40) }),
    ).toBeNull()
  })
})
