import { describe, expect, it, vi } from 'vitest'

vi.mock('@/data/supabase', () => ({ getSupabase: () => ({}) }))
vi.mock('@/data/sync/engine', () => ({ stopSync: () => {}, syncNow: async () => {} }))
vi.mock('@/data/db', () => ({ db: {} }))

const { authErrorMessage } = await import('./session')

describe('authErrorMessage', () => {
  it('maps common Supabase errors to plain language', () => {
    expect(authErrorMessage('Invalid login credentials')).toMatch(/don’t match/)
    expect(authErrorMessage('User already registered')).toMatch(/already exists/)
    expect(authErrorMessage('Email not confirmed')).toMatch(/confirm your email/)
    expect(authErrorMessage('TypeError: Failed to fetch')).toMatch(/connection/)
    expect(authErrorMessage('Password should be at least 8 characters.')).toBe(
      'Password should be at least 8 characters.',
    )
    expect(authErrorMessage('weird internal thing')).toMatch(/Something went wrong/)
  })
})
