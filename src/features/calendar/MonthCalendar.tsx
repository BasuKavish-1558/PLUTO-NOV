import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  addMonths,
  fromLocalDate,
  monthGrid,
  toLocalDate,
  yearMonthOf,
  type LocalDate,
  type YearMonth,
} from '@/domain/local-date'
import { springSnappy, springSoft } from '@/lib/motion'
import { cn } from '@/lib/utils'

const weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const monthFormat = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' })
const dayFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'full' })

/**
 * GitHub-style month grid (CL-1, CL-2, CL-4): a day with a workout is filled,
 * a day without one is not. Binary shading, no intensity levels.
 */
export function MonthCalendar({ workoutDays }: { workoutDays: ReadonlySet<LocalDate> }) {
  const today = toLocalDate(new Date())
  const [shown, setShown] = useState<YearMonth>(() => yearMonthOf(today))
  const [direction, setDirection] = useState(0)
  const isCurrentMonth =
    shown.year === yearMonthOf(today).year && shown.month === yearMonthOf(today).month

  const go = (delta: number) => {
    setDirection(delta)
    setShown((m) => addMonths(m, delta))
  }

  const key = `${shown.year}-${shown.month}`
  const title = monthFormat.format(new Date(shown.year, shown.month - 1, 1))

  return (
    <section
      aria-label="Workout calendar"
      className="bg-card w-full max-w-xl rounded-xl border p-4 sm:p-6"
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold tracking-tight" aria-live="polite">
          {title}
        </h2>
        <div className="flex items-center gap-1">
          {!isCurrentMonth && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setDirection(0)
                setShown(yearMonthOf(today))
              }}
            >
              Today
            </Button>
          )}
          <Button variant="ghost" size="icon" aria-label="Previous month" onClick={() => go(-1)}>
            <ChevronLeft />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Next month" onClick={() => go(1)}>
            <ChevronRight />
          </Button>
        </div>
      </div>

      <div className="text-muted-foreground mb-2 grid grid-cols-7 gap-1.5 text-center text-xs font-medium sm:gap-2">
        {weekdayLabels.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false} custom={direction}>
        <motion.div
          key={key}
          role="grid"
          aria-label={title}
          initial={{ opacity: 0, x: direction * 24 }}
          animate={{ opacity: 1, x: 0, transition: springSoft }}
          exit={{ opacity: 0, x: direction * -24, transition: { duration: 0.12 } }}
          className="grid gap-1.5 sm:gap-2"
        >
          {monthGrid(shown).map((week) => (
            <div key={week[0]!.date} role="row" className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {week.map((cell, i) => {
                const done = workoutDays.has(cell.date)
                const isToday = cell.date === today
                const day = fromLocalDate(cell.date).getDate()
                return (
                  <div
                    key={cell.date}
                    role="gridcell"
                    aria-label={`${dayFormat.format(fromLocalDate(cell.date))}${done ? ', workout done' : ''}`}
                    className={cn(
                      'bg-muted relative flex aspect-square items-center justify-center overflow-hidden rounded-lg text-sm tabular-nums',
                      !cell.inMonth && 'opacity-35',
                      isToday && 'ring-primary ring-2 ring-offset-2 ring-offset-[var(--card)]',
                    )}
                  >
                    {done && (
                      <motion.span
                        aria-hidden
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ ...springSnappy, delay: i * 0.02 }}
                        className="bg-primary absolute inset-0 rounded-lg"
                      />
                    )}
                    <span
                      className={cn(
                        'relative',
                        done ? 'text-primary-foreground font-semibold' : 'text-muted-foreground',
                        isToday && !done && 'text-foreground font-semibold',
                      )}
                    >
                      {day}
                    </span>
                  </div>
                )
              })}
            </div>
          ))}
        </motion.div>
      </AnimatePresence>

      <div className="text-muted-foreground mt-4 flex items-center gap-4 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="bg-primary size-3 rounded-sm" aria-hidden /> Workout done
        </span>
        <span className="flex items-center gap-1.5">
          <span className="bg-muted size-3 rounded-sm border" aria-hidden /> Rest or not logged
        </span>
      </div>
    </section>
  )
}
