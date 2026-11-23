/**
 * Calendar dates in the user's LOCAL time zone, as 'YYYY-MM-DD' strings.
 * Streaks, the calendar and daily protein all work on local dates, never UTC.
 */
export type LocalDate = string

const pad = (n: number) => String(n).padStart(2, '0')

export function toLocalDate(d: Date): LocalDate {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** Parses a LocalDate to a Date at local midnight. */
export function fromLocalDate(value: LocalDate): Date {
  const [y, m, d] = value.split('-').map(Number)
  if (!y || !m || !d) throw new Error(`Invalid LocalDate: ${value}`)
  return new Date(y, m - 1, d)
}

export function addDays(value: LocalDate, days: number): LocalDate {
  const d = fromLocalDate(value)
  d.setDate(d.getDate() + days)
  return toLocalDate(d)
}

/** ISO weekday: 1 = Monday … 7 = Sunday (matches split_days.weekday). */
export function isoWeekday(value: LocalDate): number {
  const day = fromLocalDate(value).getDay()
  return day === 0 ? 7 : day
}

/** A month as { year, month } with month 1-12. */
export type YearMonth = { year: number; month: number }

export function yearMonthOf(value: LocalDate): YearMonth {
  const d = fromLocalDate(value)
  return { year: d.getFullYear(), month: d.getMonth() + 1 }
}

export function addMonths({ year, month }: YearMonth, delta: number): YearMonth {
  const index = year * 12 + (month - 1) + delta
  return { year: Math.floor(index / 12), month: (index % 12) + 1 }
}

export type MonthCell = { date: LocalDate; inMonth: boolean }

/**
 * Weeks (Monday first) covering the whole month. Leading and trailing cells
 * from neighbouring months have inMonth = false. Always 4 to 6 rows.
 */
export function monthGrid({ year, month }: YearMonth): MonthCell[][] {
  const first = toLocalDate(new Date(year, month - 1, 1))
  const daysInMonth = new Date(year, month, 0).getDate()
  const lead = isoWeekday(first) - 1
  const total = Math.ceil((lead + daysInMonth) / 7) * 7

  const weeks: MonthCell[][] = []
  for (let i = 0; i < total; i++) {
    const date = addDays(first, i - lead)
    const cell = { date, inMonth: i >= lead && i < lead + daysInMonth }
    if (i % 7 === 0) weeks.push([])
    weeks[weeks.length - 1]!.push(cell)
  }
  return weeks
}
