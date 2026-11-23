import { addDays, yearMonthOf, type LocalDate, type YearMonth } from './local-date'

/**
 * Consecutive local days with a workout, ending today if today has one,
 * otherwise ending yesterday (an unfinished today doesn't break the streak).
 * Derived from history, so it stays correct after any edit or delete.
 */
export function currentStreak(workoutDays: ReadonlySet<LocalDate>, today: LocalDate): number {
  let cursor = workoutDays.has(today) ? today : addDays(today, -1)
  let streak = 0
  while (workoutDays.has(cursor)) {
    streak++
    cursor = addDays(cursor, -1)
  }
  return streak
}

/** True when a streak is alive but today still needs a workout to extend it. */
export function streakNeedsToday(workoutDays: ReadonlySet<LocalDate>, today: LocalDate): boolean {
  return !workoutDays.has(today) && workoutDays.has(addDays(today, -1))
}

/** Days trained in a month: distinct workout days, so two workouts on one day count once. */
export function daysTrainedInMonth(
  workoutDays: ReadonlySet<LocalDate>,
  { year, month }: YearMonth,
): number {
  let count = 0
  for (const day of workoutDays) {
    const ym = yearMonthOf(day)
    if (ym.year === year && ym.month === month) count++
  }
  return count
}
