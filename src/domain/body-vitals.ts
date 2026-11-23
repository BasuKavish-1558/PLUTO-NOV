import type { LocalDate } from './local-date'

export type VitalEntry = {
  id: string
  measured_on: LocalDate
  weight_kg: number | null
  height_cm: number | null
  created_at: string
}

/** Newest first: by measured date, then by when the entry was made. */
export function sortVitalsNewestFirst<T extends VitalEntry>(entries: readonly T[]): T[] {
  return [...entries].sort(
    (a, b) =>
      b.measured_on.localeCompare(a.measured_on) || b.created_at.localeCompare(a.created_at),
  )
}

export function latestWeightKg(entries: readonly VitalEntry[]): number | null {
  return sortVitalsNewestFirst(entries).find((e) => e.weight_kg !== null)?.weight_kg ?? null
}

/** Height is one current value: the most recent entry that has one (BV-3). */
export function currentHeightCm(entries: readonly VitalEntry[]): number | null {
  return sortVitalsNewestFirst(entries).find((e) => e.height_cm !== null)?.height_cm ?? null
}

/** Body weight entries only, newest first (BV-2). */
export function weightHistory<T extends VitalEntry>(entries: readonly T[]): T[] {
  return sortVitalsNewestFirst(entries).filter((e) => e.weight_kg !== null)
}

/** BMI = kg / m², one decimal. Read-only, derived (BV-4). */
export function bmi(weightKg: number, heightCm: number): number {
  const m = heightCm / 100
  return Math.round((weightKg / (m * m)) * 10) / 10
}
