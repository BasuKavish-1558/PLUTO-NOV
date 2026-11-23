import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router'
import { MailCheck } from 'lucide-react'
import { FormField } from '@/components/FormField'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getSupabase } from '@/data/supabase'
import { AuthLayout } from './AuthLayout'
import { PasswordInput } from './PasswordInput'
import { fieldErrors, signInSchema, signUpSchema } from './schemas'
import { authErrorMessage } from './session'

/** P-1: create an account once (default) or sign in. The session then persists until sign-out. */
export function AuthPage() {
  const [params, setParams] = useSearchParams()
  const mode = params.get('mode') === 'sign-in' ? 'sign-in' : 'sign-up'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [confirmSentTo, setConfirmSentTo] = useState<string | null>(null)

  const switchMode = () => {
    setErrors({})
    setFormError(null)
    setParams(mode === 'sign-up' ? { mode: 'sign-in' } : {}, { replace: true })
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    const parsed = (mode === 'sign-up' ? signUpSchema : signInSchema).safeParse({
      email: email.trim(),
      password,
    })
    if (!parsed.success) return setErrors(fieldErrors(parsed.error))
    setErrors({})
    setBusy(true)
    const auth = getSupabase().auth
    const { data, error } =
      mode === 'sign-up'
        ? await auth.signUp({
            ...parsed.data,
            options: { emailRedirectTo: `${window.location.origin}/` },
          })
        : await auth.signInWithPassword(parsed.data)
    setBusy(false)
    if (error) return setFormError(authErrorMessage(error.message))
    // With email confirmation on, sign-up returns no session until the link is clicked.
    if (mode === 'sign-up' && !data.session) setConfirmSentTo(parsed.data.email)
    // Otherwise the auth listener picks up the session and the routes move on to onboarding.
  }

  if (confirmSentTo) {
    return (
      <AuthLayout
        title="Check your inbox"
        subtitle={`We sent a confirmation link to ${confirmSentTo}.`}
      >
        <div className="bg-muted text-muted-foreground flex items-start gap-3 rounded-xl p-4 text-sm">
          <MailCheck className="text-primary size-5 shrink-0" />
          Open the link on this device to finish creating your account. You can close this tab.
        </div>
        <Button variant="ghost" className="mt-6 w-full" onClick={() => setConfirmSentTo(null)}>
          Use a different email
        </Button>
      </AuthLayout>
    )
  }

  const signUp = mode === 'sign-up'
  return (
    <AuthLayout
      title={signUp ? 'Create your account' : 'Welcome back'}
      subtitle={
        signUp ? 'Track your splits, workouts and protein in one place.' : 'Sign in to continue.'
      }
    >
      <form onSubmit={onSubmit} noValidate className="grid gap-5">
        <FormField id="email" label="Email" error={errors.email}>
          <Input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
        </FormField>
        <FormField
          id="password"
          label="Password"
          error={errors.password}
          hint={signUp ? 'At least 8 characters.' : undefined}
        >
          <PasswordInput
            id="password"
            autoComplete={signUp ? 'new-password' : 'current-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
          />
        </FormField>
        {formError && (
          <p role="alert" className="bg-destructive/10 text-destructive rounded-xl p-3 text-sm">
            {formError}
          </p>
        )}
        <Button type="submit" size="lg" disabled={busy}>
          {busy ? 'Please wait…' : signUp ? 'Create account' : 'Sign in'}
        </Button>
      </form>

      <div className="text-muted-foreground mt-6 flex flex-col items-center gap-1 text-sm">
        <p>
          {signUp ? 'Already have an account?' : 'New to Pluto?'}{' '}
          <button type="button" onClick={switchMode} className="text-primary h-11 font-medium">
            {signUp ? 'Sign in' : 'Create an account'}
          </button>
        </p>
        {!signUp && (
          <Link to="/auth/reset" className="hover:text-foreground flex h-11 items-center">
            Forgot your password?
          </Link>
        )}
      </div>
    </AuthLayout>
  )
}
