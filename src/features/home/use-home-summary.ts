import { toLocalDate, yearMonthOf, type LocalDate } from '@/domain/local-date'
import { currentStreak, daysTrainedInMonth, streakNeedsToday } from '@/domain/streak'

export type TodayPlan =
  | { kind: 'no-split' }
  | { kind: 'rest'; splitName: string }
  | { kind: 'workout'; splitName: string; dayLabel: string; exerciseCount: number }

export type RecentPr = {
  id: string
  exerciseName: string
  weightKg: number
  reps: number
  loggedOn: LocalDate
}

export type HomeSummary = {
  today: LocalDate
  workoutDays: ReadonlySet<LocalDate>
  streak: number
  streakNeedsToday: boolean
  daysThisMonth: number
  todayPlan: TodayPlan
  protein: { consumedG: number; goalG: number | null }
  latestBodyWeightKg: number | null
  recentPrs: RecentPr[]
}

/**
 * Everything Home shows, in one place. Phase 1 reads these from Dexie
 * (workouts, active split, protein entries + goal, body vitals); Phase 2 adds PRs.
 * Until then the inputs are empty and the derived values follow from them.
 */
export function useHomeSummary(): HomeSummary {
  const today = toLocalDate(new Date())
  const workoutDays: ReadonlySet<LocalDate> = new Set()

  return {
    today,
    workoutDays,
    streak: currentStreak(workoutDays, today),
    streakNeedsToday: streakNeedsToday(workoutDays, today),
    daysThisMonth: daysTrainedInMonth(workoutDays, yearMonthOf(today)),
    todayPlan: { kind: 'no-split' },
    protein: { consumedG: 0, goalG: null },
    latestBodyWeightKg: null,
    recentPrs: [],
  }
}
