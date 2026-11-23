import { latestWeightKg } from '@/domain/body-vitals'
import { toLocalDate, yearMonthOf, type LocalDate } from '@/domain/local-date'
import { currentStreak, daysTrainedInMonth, streakNeedsToday } from '@/domain/streak'
import { useBodyVitals } from '@/features/body-vitals/use-body-vitals'

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
 * Everything Home shows, in one place, read live from Dexie. Body weight is real
 * since Phase 1a; workouts, the active split and protein arrive in Phase 1b-1d,
 * and PRs in Phase 2. Until then those inputs are empty.
 */
export function useHomeSummary(): HomeSummary {
  const today = toLocalDate(new Date())
  const workoutDays: ReadonlySet<LocalDate> = new Set()
  const vitals = useBodyVitals()

  return {
    today,
    workoutDays,
    streak: currentStreak(workoutDays, today),
    streakNeedsToday: streakNeedsToday(workoutDays, today),
    daysThisMonth: daysTrainedInMonth(workoutDays, yearMonthOf(today)),
    todayPlan: { kind: 'no-split' },
    protein: { consumedG: 0, goalG: null },
    latestBodyWeightKg: latestWeightKg(vitals),
    recentPrs: [],
  }
}
