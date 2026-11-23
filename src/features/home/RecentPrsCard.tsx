import { Link } from 'react-router'
import { ChevronRight, Trophy } from 'lucide-react'
import { fromLocalDate } from '@/domain/local-date'
import type { RecentPr } from './use-home-summary'

const shortDate = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short' })

/** The latest manually logged PRs. */
export function RecentPrsCard({ prs }: { prs: RecentPr[] }) {
  return (
    <section className="bg-card rounded-xl border p-5">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-semibold">
          <Trophy className="text-primary size-4" />
          Recent PRs
        </h2>
        <Link
          to="/progress"
          className="text-muted-foreground hover:text-foreground -mr-2 flex h-11 items-center px-2 text-sm"
        >
          All <ChevronRight className="size-4" />
        </Link>
      </div>
      {prs.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No PRs yet. When you hit one, log it from your workout and it shows up here.
        </p>
      ) : (
        <ul className="divide-y">
          {prs.map((pr) => (
            <li key={pr.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <span className="truncate font-medium">{pr.exerciseName}</span>
              <span className="text-muted-foreground shrink-0 tabular-nums">
                {pr.weightKg} kg × {pr.reps} · {shortDate.format(fromLocalDate(pr.loggedOn))}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
