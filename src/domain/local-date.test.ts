import { describe, expect, it } from 'vitest'
import {
  addDays,
  addMonths,
  fromLocalDate,
  isoWeekday,
  monthGrid,
  toLocalDate,
  yearMonthOf,
} from './local-date'

describe('local dates', () => {
  it('formats using local fields, not UTC', () => {
    expect(toLocalDate(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05')
    expect(toLocalDate(new Date(2026, 10, 23, 0, 1))).toBe('2026-11-23')
  })

  it('round-trips and rejects garbage', () => {
    expect(toLocalDate(fromLocalDate('2024-02-29'))).toBe('2024-02-29')
    expect(() => fromLocalDate('nope')).toThrow()
  })

  it('adds days across month, year and leap boundaries', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01')
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
    expect(addDays('2024-03-01', -1)).toBe('2024-02-29')
    expect(addDays('2026-03-29', 1)).toBe('2026-03-30') // DST weekend in Europe
  })

  it('uses ISO weekdays (Monday = 1, Sunday = 7)', () => {
    expect(isoWeekday('2026-11-23')).toBe(1)
    expect(isoWeekday('2026-11-29')).toBe(7)
  })

  it('moves between months across years', () => {
    expect(addMonths({ year: 2026, month: 1 }, -1)).toEqual({ year: 2025, month: 12 })
    expect(addMonths({ year: 2026, month: 12 }, 1)).toEqual({ year: 2027, month: 1 })
    expect(addMonths({ year: 2026, month: 5 }, -17)).toEqual({ year: 2024, month: 12 })
    expect(yearMonthOf('2026-11-23')).toEqual({ year: 2026, month: 11 })
  })
})

describe('monthGrid', () => {
  it('starts on Monday and pads with neighbouring days', () => {
    const weeks = monthGrid({ year: 2026, month: 11 }) // Nov 1 2026 is a Sunday
    expect(weeks).toHaveLength(6)
    expect(weeks[0]![0]).toEqual({ date: '2026-10-26', inMonth: false })
    expect(weeks[0]![6]).toEqual({ date: '2026-11-01', inMonth: true })
    expect(weeks[5]![0]).toEqual({ date: '2026-11-30', inMonth: true })
    expect(weeks[5]![6]).toEqual({ date: '2026-12-06', inMonth: false })
  })

  it('covers every day of the month exactly once', () => {
    for (const ym of [
      { year: 2026, month: 2 },
      { year: 2024, month: 2 },
      { year: 2021, month: 2 }, // Feb 2021 fits exactly 4 rows
      { year: 2026, month: 8 },
    ]) {
      const days = monthGrid(ym)
        .flat()
        .filter((c) => c.inMonth)
      expect(days).toHaveLength(new Date(ym.year, ym.month, 0).getDate())
      expect(days.every((c) => yearMonthOf(c.date).month === ym.month)).toBe(true)
    }
    expect(monthGrid({ year: 2021, month: 2 })).toHaveLength(4)
  })
})
