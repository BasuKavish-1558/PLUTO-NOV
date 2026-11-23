import { SegmentedControl } from '@/components/SegmentedControl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { updateProfile } from '@/data/repos/profile'
import { useUnits } from './profile-context'

/** P-6: switch units any time. Values are stored in kg and cm, so nothing is converted in storage. */
export function UnitsCard() {
  const { weightUnit, heightUnit } = useUnits()
  return (
    <Card>
      <CardHeader>
        <CardTitle>Units</CardTitle>
        <CardDescription>Everything you’ve logged is shown in the units you pick.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label>Weight</Label>
          <SegmentedControl
            label="Weight unit"
            value={weightUnit}
            onChange={(v) => void updateProfile({ weight_unit: v })}
            options={[
              { value: 'kg', label: 'Kilograms (kg)' },
              { value: 'lb', label: 'Pounds (lb)' },
            ]}
          />
        </div>
        <div className="grid gap-2">
          <Label>Height</Label>
          <SegmentedControl
            label="Height unit"
            value={heightUnit}
            onChange={(v) => void updateProfile({ height_unit: v })}
            options={[
              { value: 'cm', label: 'Centimetres' },
              { value: 'ft_in', label: 'Feet & inches' },
            ]}
          />
        </div>
      </CardContent>
    </Card>
  )
}
