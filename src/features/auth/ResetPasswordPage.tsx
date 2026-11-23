import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { FormField } from '@/components/FormField'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getSupabase } from '@/data/supabase'
import { AuthLayout } from './AuthLayout'
import { emailSchema, fieldErrors } from './schemas'
import { authErrorMessage } from './session'

export function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const parsed = emailSchema.safeParse({ email: email.trim() })
    if (!parsed.success) return setError(fieldErrors(parsed.error).email ?? null)
    setBusy(true)
    const { error: err } = await getSupabase().auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    })
    setBusy(false)
    if (err) return setError(authErrorMessage(err.message))
    setSent(true)
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle={
        sent
          ? 'If an account exists for that email, a reset link is on its way.'
          : 'We’ll email you a link to choose a new password.'
      }
    >
      {!sent && (
        <form onSubmit={onSubmit} noValidate className="grid gap-5">
          <FormField id="email" label="Email" error={error}>
            <Input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!error}
            />
          </FormField>
          <Button type="submit" size="lg" disabled={busy}>
            {busy ? 'Sending…' : 'Send reset link'}
          </Button>
        </form>
      )}
      <Button asChild variant="ghost" className="mt-4 w-full">
        <Link to="/auth?mode=sign-in">Back to sign in</Link>
      </Button>
    </AuthLayout>
  )
}
