/**
 * Unit conversion. Weight is always stored in kg and height in cm;
 * these helpers convert only for display and input (architecture rule 1).
 */
export type WeightUnit = 'kg' | 'lb'
export type HeightUnit = 'cm' | 'ft_in'

export const KG_PER_LB = 0.45359237
const CM_PER_INCH = 2.54

export const kgToLb = (kg: number) => kg / KG_PER_LB
export const lbToKg = (lb: number) => lb * KG_PER_LB

/** Weight in the user's unit. */
export function toDisplayWeight(kg: number, unit: WeightUnit): number {
  return unit === 'kg' ? kg : kgToLb(kg)
}

/** Weight typed in the user's unit, converted to kg for storage (3 decimals, like the DB column). */
export function toStoredKg(value: number, unit: WeightUnit): number {
  const kg = unit === 'kg' ? value : lbToKg(value)
  return Math.round(kg * 1000) / 1000
}

/** Rounds to at most `decimals` places and drops trailing zeros: 80 -> "80", 80.25 -> "80.3". */
export function formatNumber(value: number, decimals = 1): string {
  const factor = 10 ** decimals
  const rounded = Math.round(value * factor) / factor
  return String(Object.is(rounded, -0) ? 0 : rounded)
}

export function formatWeight(kg: number, unit: WeightUnit): string {
  return `${formatNumber(toDisplayWeight(kg, unit))} ${unit}`
}

export type FeetInches = { feet: number; inches: number }

/** cm to whole feet + inches rounded to the nearest inch (12 in rolls over to the next foot). */
export function cmToFtIn(cm: number): FeetInches {
  const totalInches = Math.round(cm / CM_PER_INCH)
  return { feet: Math.floor(totalInches / 12), inches: totalInches % 12 }
}

export function ftInToCm({ feet, inches }: FeetInches): number {
  return Math.round((feet * 12 + inches) * CM_PER_INCH * 10) / 10
}

export function formatHeight(cm: number, unit: HeightUnit): string {
  if (unit === 'cm') return `${formatNumber(cm)} cm`
  const { feet, inches } = cmToFtIn(cm)
  return `${feet} ft ${inches} in`
}

/** Parses user-typed numbers, accepting a comma as decimal separator. Returns null if not a positive number. */
export function parsePositiveNumber(text: string): number | null {
  const trimmed = text.trim().replace(',', '.')
  if (!/^\d+(\.\d+)?$/.test(trimmed)) return null
  const value = Number(trimmed)
  return value > 0 ? value : null
}

/** Valid ranges, matching the database checks. */
export const BODY_WEIGHT_KG = { min: 20, max: 400 } as const
export const HEIGHT_CM = { min: 100, max: 250 } as const
