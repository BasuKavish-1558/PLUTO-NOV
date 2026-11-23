import { Dumbbell } from 'lucide-react'
import { ComingSoon } from '@/components/ComingSoon'
import { PageHeader } from '@/components/PageHeader'

export function WorkoutPage() {
  return (
    <>
      <PageHeader title="Workout" />
      <ComingSoon
        icon={Dumbbell}
        title="Workout"
        description="Start or resume a workout with a timer, log sets in two taps, and see your history. Arrives in Phase 1."
      />
    </>
  )
}
