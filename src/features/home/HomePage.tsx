import { PageHeader } from '@/components/PageHeader'
import { MonthCalendar } from '@/features/calendar/MonthCalendar'
import type { LocalDate } from '@/domain/local-date'

// Phase 1 fills this from logged workouts (distinct workout_date values).
const noWorkoutsYet: ReadonlySet<LocalDate> = new Set()

export function HomePage() {
  return (
    <>
      <PageHeader title="Home" />
      <MonthCalendar workoutDays={noWorkoutsYet} />
      <p className="text-muted-foreground mt-3 text-sm">
        Days fill in as you log workouts. Logging arrives in Phase 1.
      </p>
    </>
  )
}
