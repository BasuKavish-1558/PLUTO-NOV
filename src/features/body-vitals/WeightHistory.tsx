import { AnimatePresence, motion } from 'motion/react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { deleteBodyVital } from '@/data/repos/body-vitals'
import type { BodyVital } from '@/data/models'
import { weightHistory } from '@/domain/body-vitals'
import { fromLocalDate } from '@/domain/local-date'
import { formatWeight } from '@/domain/units'
import { useUnits } from '@/features/profile/profile-context'

const dateFormat = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

/** Dated body weight entries, newest first (BV-2). Deleting one removes only that entry. */
export function WeightHistory({ entries, limit }: { entries: BodyVital[]; limit?: number }) {
  const { weightUnit } = useUnits()
  const rows = weightHistory(entries).slice(0, limit)

  if (rows.length === 0) {
    return <p className="text-muted-foreground text-sm">No weight entries yet.</p>
  }

  return (
    <ul className="divide-y">
      <AnimatePresence initial={false}>
        {rows.map((row) => (
          <motion.li
            key={row.id}
            layout
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-between gap-3 overflow-hidden"
          >
            <span className="text-muted-foreground py-2 text-sm">
              {dateFormat.format(fromLocalDate(row.measured_on))}
            </span>
            <span className="flex items-center gap-1">
              <span className="font-medium tabular-nums">
                {formatWeight(row.weight_kg!, weightUnit)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Delete entry from ${row.measured_on}`}
                onClick={() => void deleteBodyVital(row.id)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </Button>
            </span>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  )
}
