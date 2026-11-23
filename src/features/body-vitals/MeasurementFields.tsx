import { SegmentedControl } from '@/components/SegmentedControl'
import { FormField } from '@/components/FormField'
import { Input } from '@/components/ui/input'
import type { HeightUnit, WeightUnit } from '@/domain/units'
import type { HeightText } from './parse'

const weightUnits = [
  { value: 'kg', label: 'kg' },
  { value: 'lb', label: 'lb' },
] as const
const heightUnits = [
  { value: 'cm', label: 'cm' },
  { value: 'ft_in', label: 'ft / in' },
] as const

export function WeightField({
  id,
  label = 'Body weight',
  value,
  onChange,
  unit,
  onUnitChange,
  error,
}: {
  id: string
  label?: string
  value: string
  onChange: (value: string) => void
  unit: WeightUnit
  onUnitChange?: (unit: WeightUnit) => void
  error?: string | null
}) {
  return (
    <FormField id={id} label={label} error={error}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            id={id}
            inputMode="decimal"
            autoComplete="off"
            placeholder={unit === 'kg' ? '75' : '165'}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            aria-invalid={!!error}
            className="pr-10"
          />
          <span className="text-muted-foreground pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-sm">
            {unit}
          </span>
        </div>
        {onUnitChange && (
          <SegmentedControl
            label="Weight unit"
            value={unit}
            onChange={onUnitChange}
            options={weightUnits}
            className="w-32 shrink-0"
          />
        )}
      </div>
    </FormField>
  )
}

export function HeightField({
  id,
  value,
  onChange,
  unit,
  onUnitChange,
  error,
}: {
  id: string
  value: HeightText
  onChange: (value: HeightText) => void
  unit: HeightUnit
  onUnitChange?: (unit: HeightUnit) => void
  error?: string | null
}) {
  const suffix =
    'text-muted-foreground pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-sm'
  return (
    <FormField id={id} label="Height" error={error}>
      <div className="flex gap-2">
        {unit === 'cm' ? (
          <div className="relative flex-1">
            <Input
              id={id}
              inputMode="decimal"
              autoComplete="off"
              placeholder="175"
              value={value.cm}
              onChange={(e) => onChange({ ...value, cm: e.target.value })}
              aria-invalid={!!error}
              className="pr-10"
            />
            <span className={suffix}>cm</span>
          </div>
        ) : (
          <div className="flex flex-1 gap-2">
            <div className="relative flex-1">
              <Input
                id={id}
                inputMode="numeric"
                autoComplete="off"
                placeholder="5"
                aria-label="Feet"
                value={value.feet}
                onChange={(e) => onChange({ ...value, feet: e.target.value })}
                aria-invalid={!!error}
                className="pr-9"
              />
              <span className={suffix}>ft</span>
            </div>
            <div className="relative flex-1">
              <Input
                inputMode="numeric"
                autoComplete="off"
                placeholder="9"
                aria-label="Inches"
                value={value.inches}
                onChange={(e) => onChange({ ...value, inches: e.target.value })}
                aria-invalid={!!error}
                className="pr-9"
              />
              <span className={suffix}>in</span>
            </div>
          </div>
        )}
        {onUnitChange && (
          <SegmentedControl
            label="Height unit"
            value={unit}
            onChange={onUnitChange}
            options={heightUnits}
            className="w-32 shrink-0"
          />
        )}
      </div>
    </FormField>
  )
}
