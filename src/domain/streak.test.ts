import { describe, expect, it } from 'vitest'
import { currentStreak, daysTrainedInMonth, streakNeedsToday } from './streak'

const days = (...d: string[]) => new Set(d)

describe('currentStreak', () => {
  it('is 0 with no workouts', () => {
    expect(currentStreak(days(), '2026-11-23')).toBe(0)
  })

  it('counts back from today when today is done', () => {
    expect(currentStreak(days('2026-11-21', '2026-11-22', '2026-11-23'), '2026-11-23')).toBe(3)
  })

  it('stays alive through yesterday when today is not done yet', () => {
    expect(currentStreak(days('2026-11-21', '2026-11-22'), '2026-11-23')).toBe(2)
  })

  it('breaks after a full missed day', () => {
    expect(currentStreak(days('2026-11-20', '2026-11-21'), '2026-11-23')).toBe(0)
  })

  it('stops at the first gap and crosses month boundaries', () => {
    expect(
      currentStreak(days('2026-10-28', '2026-10-30', '2026-10-31', '2026-11-01'), '2026-11-01'),
    ).toBe(3)
  })

  it('updates when a past workout is deleted (derived, not stored)', () => {
    const history = days('2026-11-21', '2026-11-22', '2026-11-23')
    history.delete('2026-11-22')
    expect(currentStreak(history, '2026-11-23')).toBe(1)
  })
})

describe('streakNeedsToday', () => {
  it('is true only when yesterday is done and today is not', () => {
    expect(streakNeedsToday(days('2026-11-22'), '2026-11-23')).toBe(true)
    expect(streakNeedsToday(days('2026-11-22', '2026-11-23'), '2026-11-23')).toBe(false)
    expect(streakNeedsToday(days('2026-11-21'), '2026-11-23')).toBe(false)
  })
})

describe('daysTrainedInMonth', () => {
  it('counts distinct days inside the month only', () => {
    const history = days('2026-10-31', '2026-11-01', '2026-11-15', '2026-11-30', '2026-12-01')
    expect(daysTrainedInMonth(history, { year: 2026, month: 11 })).toBe(3)
    expect(daysTrainedInMonth(history, { year: 2025, month: 11 })).toBe(0)
  })
})
