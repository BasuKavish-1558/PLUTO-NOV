import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { FormField } from '@/components/FormField'
import { Splash } from '@/components/Splash'
import { Button } from '@/components/ui/button'
import { getSupabase } from '@/data/supabase'
import { useAuthStore } from './auth-store'
import { AuthLayout } from './AuthLayout'
import { PasswordInput } from './PasswordInput'
import { fieldErrors, newPasswordSchema } from './schemas'
import { authErrorMessage } from './session'

/** Landing page of the reset email: the link signs the user in, then they choose a new password. */
export function UpdatePasswordPage() {
  const status = useAuthStore((s) => s.status)
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (status === 'loading') return <Splash />
  if (status === 'signed-out') return <Navigate to="/auth/reset" replace />

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const parsed = newPasswordSchema.safeParse({ password })
    if (!parsed.success) return setError(fieldErrors(parsed.error).password ?? null)
    setBusy(true)
    const { error: err } = await getSupabase().auth.updateUser({ password: parsed.data.password })
    setBusy(false)
    if (err) return setError(authErrorMessage(err.message))
    useAuthStore.setState({ recovering: false })
    navigate('/', { replace: true })
  }

  return (
    <AuthLayout title="Choose a new password">
      <form onSubmit={onSubmit} noValidate className="grid gap-5">
        <FormField id="password" label="New password" error={error} hint="At least 8 characters.">
          <PasswordInput
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!error}
          />
        </FormField>
        <Button type="submit" size="lg" disabled={busy}>
          {busy ? 'Saving…' : 'Save password'}
        </Button>
      </form>
    </AuthLayout>
  )
}
