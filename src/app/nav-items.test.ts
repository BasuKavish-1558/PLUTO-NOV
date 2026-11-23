import { describe, expect, it } from 'vitest'
import {
  barItems,
  isActivePath,
  isMoreActive,
  moreItems,
  navItems,
  titleForPath,
} from './nav-items'

describe('navigation', () => {
  it('puts 4 items on the bar (plus More), 2 under More and Profile in the header', () => {
    expect(barItems.map((i) => i.label)).toEqual(['Home', 'Workout', 'Calendar', 'Progress'])
    expect(moreItems.map((i) => i.label)).toEqual(['Split', 'Nutrition'])
    expect(navItems.filter((i) => i.placement === 'header').map((i) => i.label)).toEqual([
      'Profile',
    ])
    expect(navItems).toHaveLength(7)
  })

  it('matches Home only exactly and others by prefix', () => {
    expect(isActivePath('/', '/')).toBe(true)
    expect(isActivePath('/workout', '/')).toBe(false)
    expect(isActivePath('/workout/history', '/workout')).toBe(true)
    expect(isActivePath('/workouts', '/workout')).toBe(false)
  })

  it('marks More active on its child routes', () => {
    expect(isMoreActive('/nutrition')).toBe(true)
    expect(isMoreActive('/split/builder')).toBe(true)
    expect(isMoreActive('/calendar')).toBe(false)
    expect(isMoreActive('/profile')).toBe(false)
  })

  it('derives a page title', () => {
    expect(titleForPath('/progress')).toBe('Progress')
    expect(titleForPath('/nope')).toBe('Pluto')
  })
})
