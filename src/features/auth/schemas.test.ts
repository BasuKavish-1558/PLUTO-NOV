import { describe, expect, it } from 'vitest'
import { fieldErrors, signInSchema, signUpSchema } from './schemas'

describe('auth schemas', () => {
  it('requires a valid email and an 8+ character password to sign up', () => {
    expect(signUpSchema.safeParse({ email: 'a@b.co', password: '12345678' }).success).toBe(true)
    const bad = signUpSchema.safeParse({ email: 'nope', password: 'short' })
    expect(bad.success).toBe(false)
    if (!bad.success) {
      expect(fieldErrors(bad.error)).toEqual({
        email: 'Enter a valid email address.',
        password: 'Use at least 8 characters.',
      })
    }
  })

  it('only requires a non-empty password to sign in', () => {
    expect(signInSchema.safeParse({ email: 'a@b.co', password: 'x' }).success).toBe(true)
    expect(signInSchema.safeParse({ email: 'a@b.co', password: '' }).success).toBe(false)
  })
})
