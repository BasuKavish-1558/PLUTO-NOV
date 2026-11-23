import { Link } from 'react-router'
import { CalendarCheck, Flame, Scale, type LucideIcon } from 'lucide-react'
import { formatNumber, toDisplayWeight } from '@/domain/units'
import { useUnits } from '@/features/profile/profile-context'
import { cn } from '@/lib/utils'

function Tile({
  to,
  icon: Icon,
  label,
  value,
  unit,
  hint,
}: {
  to: string
  icon: LucideIcon
  label: string
  value: string
  unit?: string
  hint?: string
}) {
  return (
    <Link
      to={to}
      className="bg-card hover:bg-accent/60 flex flex-col gap-2 rounded-xl border p-4 transition-[background-color,transform] duration-150 active:scale-[0.98] motion-reduce:active:scale-100"
    >
      <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
        <Icon className="text-primary size-4" />
        {label}
      </span>
      <span className="text-2xl font-semibold tracking-tight tabular-nums">
        {value}
        {unit && <span className="text-muted-foreground ml-1 text-sm font-medium">{unit}</span>}
      </span>
      {hint && <span className="text-muted-foreground text-xs leading-snug">{hint}</span>}
    </Link>
  )
}

/** Streak, days trained this month, and latest body weight. */
export function StatTiles({
  streak,
  streakNeedsToday,
  daysThisMonth,
  bodyWeightKg,
  className,
}: {
  streak: number
  streakNeedsToday: boolean
  daysThisMonth: number
  bodyWeightKg: number | null
  className?: string
}) {
  const { weightUnit } = useUnits()
  return (
    <div className={cn('grid grid-cols-3 gap-3', className)}>
      <Tile
        to="/calendar"
        icon={Flame}
        label="Streak"
        value={String(streak)}
        unit={streak === 1 ? 'day' : 'days'}
        hint={streakNeedsToday ? 'Train today to keep it' : undefined}
      />
      <Tile
        to="/calendar"
        icon={CalendarCheck}
        label="Month"
        value={String(daysThisMonth)}
        unit={daysThisMonth === 1 ? 'day' : 'days'}
      />
      <Tile
        to="/progress"
        icon={Scale}
        label="Weight"
        value={
          bodyWeightKg === null ? '—' : formatNumber(toDisplayWeight(bodyWeightKg, weightUnit))
        }
        unit={bodyWeightKg === null ? undefined : weightUnit}
      />
    </div>
  )
}
