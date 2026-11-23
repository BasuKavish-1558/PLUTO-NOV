import {
  BODY_WEIGHT_KG,
  HEIGHT_CM,
  ftInToCm,
  parsePositiveNumber,
  toDisplayWeight,
  toStoredKg,
  formatNumber,
  type HeightUnit,
  type WeightUnit,
} from '@/domain/units'

export type Parsed = { ok: true; value: number } | { ok: false; error: string }

/** A typed body weight in the user's unit → kg, checked against the allowed range. */
export function parseBodyWeight(text: string, unit: WeightUnit): Parsed {
  const n = parsePositiveNumber(text)
  if (n === null) return { ok: false, error: 'Enter your weight as a number.' }
  const kg = toStoredKg(n, unit)
  if (kg < BODY_WEIGHT_KG.min || kg > BODY_WEIGHT_KG.max) {
    const lo = formatNumber(toDisplayWeight(BODY_WEIGHT_KG.min, unit), 0)
    const hi = formatNumber(toDisplayWeight(BODY_WEIGHT_KG.max, unit), 0)
    return { ok: false, error: `Enter a weight between ${lo} and ${hi} ${unit}.` }
  }
  return { ok: true, value: kg }
}

export type HeightText = { cm: string; feet: string; inches: string }

/** A typed height (cm, or feet + inches) → cm, checked against the allowed range. */
export function parseHeight(text: HeightText, unit: HeightUnit): Parsed {
  let cm: number
  if (unit === 'cm') {
    const n = parsePositiveNumber(text.cm)
    if (n === null) return { ok: false, error: 'Enter your height as a number.' }
    cm = Math.round(n * 10) / 10
  } else {
    const feet = parsePositiveNumber(text.feet)
    const inches = text.inches.trim() === '' ? 0 : parsePositiveNumber(text.inches)
    if (feet === null || inches === null || !Number.isInteger(feet) || inches >= 12) {
      return { ok: false, error: 'Enter feet and inches (0–11).' }
    }
    cm = ftInToCm({ feet, inches })
  }
  if (cm < HEIGHT_CM.min || cm > HEIGHT_CM.max) {
    return {
      ok: false,
      error:
        unit === 'cm'
          ? 'Enter a height between 100 and 250 cm.'
          : 'Enter a height between 3 ft 4 in and 8 ft 2 in.',
    }
  }
  return { ok: true, value: cm }
}

export function parseAge(text: string): Parsed {
  const n = parsePositiveNumber(text)
  if (n === null || !Number.isInteger(n) || n < 13 || n > 120) {
    return { ok: false, error: 'Enter your age in whole years (13–120).' }
  }
  return { ok: true, value: n }
}
