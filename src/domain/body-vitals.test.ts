import { describe, expect, it } from 'vitest'
import { bmi, currentHeightCm, latestWeightKg, weightHistory, type VitalEntry } from './body-vitals'

const e = (
  id: string,
  measured_on: string,
  weight_kg: number | null,
  height_cm: number | null,
  created_at = `${measured_on}T08:00:00Z`,
): VitalEntry => ({ id, measured_on, weight_kg, height_cm, created_at })

const entries = [
  e('a', '2026-11-01', 82, 178),
  e('b', '2026-11-10', 81, null),
  e('c', '2026-11-20', null, 179),
  e('d', '2026-11-20', 80.5, null, '2026-11-20T07:00:00Z'),
  e('e', '2026-11-20', 80.2, null, '2026-11-20T21:00:00Z'),
]

describe('body vitals', () => {
  it('takes the latest weight by date, then by entry time', () => {
    expect(latestWeightKg(entries)).toBe(80.2)
  })

  it('takes the latest height, skipping weight-only entries', () => {
    expect(currentHeightCm(entries)).toBe(179)
  })

  it('returns null when nothing is recorded', () => {
    expect(latestWeightKg([])).toBeNull()
    expect(currentHeightCm([e('x', '2026-11-01', 80, null)])).toBeNull()
  })

  it('lists weight history newest first and leaves height-only entries out', () => {
    expect(weightHistory(entries).map((x) => x.id)).toEqual(['e', 'd', 'b', 'a'])
  })

  it('computes BMI to one decimal', () => {
    expect(bmi(80, 180)).toBe(24.7)
    expect(bmi(70, 175)).toBe(22.9)
  })
})
