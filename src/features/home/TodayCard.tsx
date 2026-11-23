import { Link } from 'react-router'
import { Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { TodayPlan } from './use-home-summary'

const weekday = new Intl.DateTimeFormat(undefined, { weekday: 'long' })

function copy(plan: TodayPlan) {
  switch (plan.kind) {
    case 'no-split':
      return { title: 'No split yet', detail: 'Pick a split to see today’s workout here.' }
    case 'rest':
      return { title: 'Rest day', detail: `${plan.splitName} has today off. Recover well.` }
    case 'workout':
      return {
        title: plan.dayLabel,
        detail: `${plan.exerciseCount} exercises · ${plan.splitName}`,
      }
  }
}

/** Today's planned workout from the active split, with the quick start button. */
export function TodayCard({ plan }: { plan: TodayPlan }) {
  const { title, detail } = copy(plan)

  return (
    <section className="bg-card rounded-xl border p-5">
      <p className="text-muted-foreground text-sm">Today · {weekday.format(new Date())}</p>
      <h2 className="mt-1 text-xl font-semibold tracking-tight">{title}</h2>
      <p className="text-muted-foreground mt-1 text-sm">{detail}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button asChild className="flex-1 sm:flex-none">
          <Link to="/workout">
            <Play />
            Start workout
          </Link>
        </Button>
        {plan.kind === 'no-split' && (
          <Button asChild variant="outline" className="flex-1 sm:flex-none">
            <Link to="/split">Choose a split</Link>
          </Button>
        )}
      </div>
    </section>
  )
}
