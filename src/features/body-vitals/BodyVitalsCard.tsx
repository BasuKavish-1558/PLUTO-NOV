import { useState, type FormEvent } from 'react'
import { Check } from 'lucide-react'
import { FormField } from '@/components/FormField'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { addBodyVital } from '@/data/repos/body-vitals'
import { updateProfile } from '@/data/repos/profile'
import { bmi, currentHeightCm, latestWeightKg } from '@/domain/body-vitals'
import { toLocalDate } from '@/domain/local-date'
import { formatHeight, formatWeight } from '@/domain/units'
import { useProfile, useUnits } from '@/features/profile/profile-context'
import { HeightField, WeightField } from './MeasurementFields'
import { parseBodyWeight, parseHeight, type HeightText } from './parse'
import { useBodyVitals } from './use-body-vitals'
import { WeightHistory } from './WeightHistory'

/** BV-1 to BV-4: current values, log a weight, update height, optional BMI, recent entries. */
export function BodyVitalsCard() {
  const entries = useBodyVitals()
  const { show_bmi } = useProfile()
  const { weightUnit, heightUnit } = useUnits()
  const weight = latestWeightKg(entries)
  const height = currentHeightCm(entries)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Body vitals</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6">
        <dl className="grid grid-cols-3 gap-3 text-center">
          <Stat label="Weight" value={weight === null ? '—' : formatWeight(weight, weightUnit)} />
          <Stat label="Height" value={height === null ? '—' : formatHeight(height, heightUnit)} />
          <Stat
            label="BMI"
            value={
              show_bmi && weight !== null && height !== null ? String(bmi(weight, height)) : '—'
            }
            muted={!show_bmi}
          />
        </dl>

        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="show-bmi" className="flex-col items-start gap-1">
            Show BMI
            <span className="text-muted-foreground text-xs font-normal">
              Calculated from your weight and height.
            </span>
          </Label>
          <Switch
            id="show-bmi"
            checked={show_bmi}
            onCheckedChange={(checked) => void updateProfile({ show_bmi: checked })}
          />
        </div>

        <LogWeightForm />
        <UpdateHeightForm />

        <div>
          <h3 className="mb-1 text-sm font-medium">Recent weigh-ins</h3>
          <WeightHistory entries={entries} limit={5} />
        </div>
      </CardContent>
    </Card>
  )
}

function Stat({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="bg-muted/60 rounded-xl px-2 py-3">
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className={muted ? 'text-muted-foreground mt-1 font-semibold' : 'mt-1 font-semibold'}>
        {value}
      </dd>
    </div>
  )
}

function useSavedFlash() {
  const [saved, setSaved] = useState(false)
  const flash = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }
  return [saved, flash] as const
}

function LogWeightForm() {
  const { weightUnit } = useUnits()
  const today = toLocalDate(new Date())
  const [value, setValue] = useState('')
  const [date, setDate] = useState(today)
  const [error, setError] = useState<string | null>(null)
  const [saved, flash] = useSavedFlash()

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const parsed = parseBodyWeight(value, weightUnit)
    if (!parsed.ok) return setError(parsed.error)
    if (!date || date > today) return setError('Pick today or an earlier date.')
    setError(null)
    await addBodyVital({ measuredOn: date, weightKg: parsed.value })
    setValue('')
    setDate(today)
    flash()
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-3">
      <WeightField
        id="log-weight"
        label="Log weight"
        value={value}
        onChange={setValue}
        unit={weightUnit}
        error={error}
      />
      <div className="flex items-end gap-2">
        <FormField id="log-weight-date" label="Date">
          <Input
            id="log-weight-date"
            type="date"
            max={today}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </FormField>
        <Button type="submit" className="flex-1">
          {saved ? <Check /> : null}
          {saved ? 'Saved' : 'Add entry'}
        </Button>
      </div>
    </form>
  )
}

function UpdateHeightForm() {
  const { heightUnit } = useUnits()
  const [value, setValue] = useState<HeightText>({ cm: '', feet: '', inches: '' })
  const [error, setError] = useState<string | null>(null)
  const [saved, flash] = useSavedFlash()

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const parsed = parseHeight(value, heightUnit)
    if (!parsed.ok) return setError(parsed.error)
    setError(null)
    await addBodyVital({ measuredOn: toLocalDate(new Date()), heightCm: parsed.value })
    setValue({ cm: '', feet: '', inches: '' })
    flash()
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-3">
      <HeightField
        id="update-height"
        value={value}
        onChange={setValue}
        unit={heightUnit}
        error={error}
      />
      <Button type="submit" variant="secondary">
        {saved ? <Check /> : null}
        {saved ? 'Saved' : 'Update height'}
      </Button>
    </form>
  )
}
