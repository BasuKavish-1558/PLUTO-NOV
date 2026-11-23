import { useState, type FormEvent } from 'react'
import { Check } from 'lucide-react'
import { FormField } from '@/components/FormField'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { updateProfile } from '@/data/repos/profile'
import { useAuthStore } from '@/features/auth/auth-store'
import { parseAge } from '@/features/body-vitals/parse'
import { AvatarPicker } from './AvatarPicker'
import { useProfile } from './profile-context'

/** P-2, P-3, P-4: photo, name, email (read-only) and age. */
export function ProfileDetailsCard() {
  const profile = useProfile()
  const email = useAuthStore((s) => s.session?.user.email ?? '')
  const [name, setName] = useState(profile.display_name ?? '')
  const [age, setAge] = useState(profile.age ? String(profile.age) : '')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState(false)

  const dirty =
    name.trim() !== (profile.display_name ?? '') || age !== (profile.age ? String(profile.age) : '')

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const next: Record<string, string> = {}
    const trimmed = name.trim()
    if (trimmed.length < 1 || trimmed.length > 60)
      next.name = 'Enter your name (up to 60 characters).'
    const a = parseAge(age)
    if (!a.ok) next.age = a.error
    setErrors(next)
    if (Object.keys(next).length || !a.ok) return
    await updateProfile({ display_name: trimmed, age: a.value })
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <Card>
      <CardContent className="grid gap-6">
        <AvatarPicker path={profile.avatar_path} name={profile.display_name} />
        <form onSubmit={onSubmit} noValidate className="grid gap-5">
          <FormField id="profile-name" label="Name" error={errors.name}>
            <Input
              id="profile-name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={!!errors.name}
            />
          </FormField>
          <FormField id="profile-email" label="Email">
            <Input id="profile-email" value={email} readOnly disabled />
          </FormField>
          <FormField id="profile-age" label="Age" error={errors.age}>
            <Input
              id="profile-age"
              inputMode="numeric"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              aria-invalid={!!errors.age}
              className="max-w-32"
            />
          </FormField>
          <Button type="submit" disabled={!dirty && !saved}>
            {saved && <Check />}
            {saved ? 'Saved' : 'Save changes'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
