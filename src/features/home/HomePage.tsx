import { motion } from 'motion/react'
import { PageHeader } from '@/components/PageHeader'
import { MonthCalendar } from '@/features/calendar/MonthCalendar'
import { springSoft } from '@/lib/motion'
import { ProteinCard } from './ProteinCard'
import { RecentPrsCard } from './RecentPrsCard'
import { StatTiles } from './StatTiles'
import { TodayCard } from './TodayCard'
import { useHomeSummary } from './use-home-summary'

const dateLine = new Intl.DateTimeFormat(undefined, {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

// Cards rise in one after another.
const item = (i: number) => ({
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { ...springSoft, delay: i * 0.04 } },
})

/**
 * Overview of the whole app. Phones: one column in priority order.
 * lg and up: today + calendar on the left, stats, protein and PRs on the right.
 */
export function HomePage() {
  const s = useHomeSummary()

  return (
    <>
      <PageHeader title="Home" />
      <p className="text-muted-foreground -mt-4 mb-6 text-sm">{dateLine.format(new Date())}</p>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:[grid-template-areas:'today_stats''calendar_protein''calendar_prs''calendar_rest']">
        <motion.div {...item(0)} className="lg:[grid-area:today]">
          <TodayCard plan={s.todayPlan} />
        </motion.div>
        <motion.div {...item(1)} className="lg:[grid-area:stats]">
          <StatTiles
            streak={s.streak}
            streakNeedsToday={s.streakNeedsToday}
            daysThisMonth={s.daysThisMonth}
            bodyWeightKg={s.latestBodyWeightKg}
            className="h-full"
          />
        </motion.div>
        <motion.div {...item(2)} className="lg:[grid-area:protein]">
          <ProteinCard consumedG={s.protein.consumedG} goalG={s.protein.goalG} />
        </motion.div>
        <motion.div {...item(3)} className="lg:[grid-area:calendar]">
          <MonthCalendar workoutDays={s.workoutDays} className="max-w-none" />
        </motion.div>
        <motion.div {...item(4)} className="lg:[grid-area:prs]">
          <RecentPrsCard prs={s.recentPrs} />
        </motion.div>
      </div>
    </>
  )
}
