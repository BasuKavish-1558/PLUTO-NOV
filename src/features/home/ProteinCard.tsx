import { Link } from 'react-router'
import { Plus } from 'lucide-react'
import { ProgressRing } from '@/components/ProgressRing'
import { Button } from '@/components/ui/button'

/** Today's protein vs goal. The goal comes from body weight × multiplier, never typed. */
export function ProteinCard({ consumedG, goalG }: { consumedG: number; goalG: number | null }) {
  const progress = goalG ? consumedG / goalG : 0
  const label =
    goalG === null
      ? `${consumedG} grams of protein today, no goal set`
      : `${consumedG} of ${goalG} grams of protein today`

  return (
    <section className="bg-card flex items-center gap-5 rounded-xl border p-5">
      <ProgressRing value={progress} label={label} size={96} stroke={9}>
        <div>
          <div className="text-xl font-semibold tabular-nums">{Math.round(consumedG)}</div>
          <div className="text-muted-foreground text-xs">{goalG ? `/ ${goalG} g` : 'g'}</div>
        </div>
      </ProgressRing>
      <div className="min-w-0 flex-1">
        <h2 className="font-semibold">Protein</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          {goalG === null
            ? 'Set your goal from your body weight.'
            : `${Math.max(goalG - Math.round(consumedG), 0)} g to go today.`}
        </p>
        <Button asChild size="sm" variant="secondary" className="mt-3">
          <Link to="/nutrition">
            <Plus />
            {goalG === null ? 'Set goal' : 'Add protein'}
          </Link>
        </Button>
      </div>
    </section>
  )
}
