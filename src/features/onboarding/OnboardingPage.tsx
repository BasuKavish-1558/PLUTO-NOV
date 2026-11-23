import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft } from 'lucide-react'
import { FormField } from '@/components/FormField'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { addBodyVital } from '@/data/repos/body-vitals'
import { updateProfile } from '@/data/repos/profile'
import { toLocalDate } from '@/domain/local-date'
import type { HeightUnit, WeightUnit } from '@/domain/units'
import { useAuthStore } from '@/features/auth/auth-store'
import { AuthLayout } from '@/features/auth/AuthLayout'
import { HeightField, WeightField } from '@/features/body-vitals/MeasurementFields'
import {
  parseAge,
  parseBodyWeight,
  parseHeight,
  type HeightText,
} from '@/features/body-vitals/parse'
import { AvatarPicker } from '@/features/profile/AvatarPicker'
import { useProfile } from '@/features/profile/profile-context'
import { useThemeStore } from '@/features/theme/theme-store'
import { springSoft } from '@/lib/motion'

/** Onboarding (section 4): profile, then age / weight / height, then Home. */
export function OnboardingPage() {
  const profile = useProfile()
  const [step, setStep] = useState<1 | 2>(profile.display_name ? 2 : 1)

  return (
    <AuthLayout
      title={step === 1 ? 'Set up your profile' : 'Your basic stats'}
      subtitle={
        step === 1
          ? 'Add your name and, if you like, a photo.'
          : 'Used for your protein goal and progress. You can change these any time.'
      }
    >
      <p className="text-muted-foreground -mt-4 mb-6 text-xs font-medium tracking-wide uppercase">
        Step {step} of 2
      </p>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step}
          initial={{ opacity: 0, x: step === 2 ? 24 : -24 }}
          animate={{ opacity: 1, x: 0, transition: springSoft }}
          exit={{ opacity: 0, x: step === 2 ? -24 : 24, transition: { duration: 0.12 } }}
        >
          {step === 1 ? (
            <ProfileStep onDone={() => setStep(2)} />
          ) : (
            <StatsStep onBack={() => setStep(1)} />
          )}
        </motion.div>
      </AnimatePresence>
    </AuthLayout>
  )
}

function ProfileStep({ onDone }: { onDone: () => void }) {
  const profile = useProfile()
  const email = useAuthStore((s) => s.session?.user.email)
  const [name, setName] = useState(profile.display_name ?? '')
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (trimmed.length < 1 || trimmed.length > 60)
      return setError('Enter your name (up to 60 characters).')
    await updateProfile({ display_name: trimmed })
    onDone()
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-6">
      <AvatarPicker path={profile.avatar_path} name={name || null} />
      <FormField id="name" label="Name" error={error}>
        <Input
          id="name"
          autoComplete="name"
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={!!error}
        />
      </FormField>
      {email && (
        <FormField id="email" label="Email">
          <Input id="email" value={email} readOnly disabled />
        </FormField>
      )}
      <Button type="submit" size="lg">
        Continue
      </Button>
    </form>
  )
}

function StatsStep({ onBack }: { onBack: () => void }) {
  const profile = useProfile()
  const navigate = useNavigate()
  const [age, setAge] = useState(profile.age ? String(profile.age) : '')
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState<HeightText>({ cm: '', feet: '', inches: '' })
  const [weightUnit, setWeightUnit] = useState<WeightUnit>(profile.weight_unit)
  const [heightUnit, setHeightUnit] = useState<HeightUnit>(profile.height_unit)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const a = parseAge(age)
    const w = parseBodyWeight(weight, weightUnit)
    const h = parseHeight(height, heightUnit)
    const next: Record<string, string> = {}
    if (!a.ok) next.age = a.error
    if (!w.ok) next.weight = w.error
    if (!h.ok) next.height = h.error
    setErrors(next)
    if (!a.ok || !w.ok || !h.ok) return

    setBusy(true)
    await addBodyVital({
      measuredOn: toLocalDate(new Date()),
      weightKg: w.value,
      heightCm: h.value,
    })
    await updateProfile({
      age: a.value,
      weight_unit: weightUnit,
      height_unit: heightUnit,
      // Keep whatever theme they picked before signing up.
      theme_pref: useThemeStore.getState().pref,
      onboarded_at: new Date().toISOString(),
    })
    navigate('/', { replace: true })
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-6">
      <FormField id="age" label="Age" error={errors.age}>
        <Input
          id="age"
          inputMode="numeric"
          autoComplete="off"
          placeholder="25"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          aria-invalid={!!errors.age}
          className="max-w-32"
        />
      </FormField>
      <WeightField
        id="weight"
        value={weight}
        onChange={setWeight}
        unit={weightUnit}
        onUnitChange={setWeightUnit}
        error={errors.weight}
      />
      <HeightField
        id="height"
        value={height}
        onChange={setHeight}
        unit={heightUnit}
        onUnitChange={setHeightUnit}
        error={errors.height}
      />
      <div className="flex gap-2">
        <Button type="button" variant="ghost" size="icon" onClick={onBack} aria-label="Back">
          <ArrowLeft />
        </Button>
        <Button type="submit" size="lg" className="flex-1" disabled={busy}>
          {busy ? 'Saving…' : 'Finish'}
        </Button>
      </div>
    </form>
  )
}
