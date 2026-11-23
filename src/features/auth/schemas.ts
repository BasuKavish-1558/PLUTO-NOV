import { z } from 'zod'

export const MIN_PASSWORD = 8

export const signUpSchema = z.object({
  email: z.email('Enter a valid email address.'),
  password: z.string().min(MIN_PASSWORD, `Use at least ${MIN_PASSWORD} characters.`),
})

export const signInSchema = z.object({
  email: z.email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
})

export const emailSchema = z.object({ email: z.email('Enter a valid email address.') })

export const newPasswordSchema = z.object({
  password: z.string().min(MIN_PASSWORD, `Use at least ${MIN_PASSWORD} characters.`),
})

/** First error message per field, for showing next to inputs. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? '')
    out[key] ??= issue.message
  }
  return out
}
