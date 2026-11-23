import { describe, expect, it } from 'vitest'
import { parseAge, parseBodyWeight, parseHeight } from './parse'

const h = (cm = '', feet = '', inches = '') => ({ cm, feet, inches })

describe('parseBodyWeight', () => {
  it('converts lb to kg for storage', () => {
    expect(parseBodyWeight('180', 'lb')).toEqual({ ok: true, value: 81.647 })
    expect(parseBodyWeight('80,5', 'kg')).toEqual({ ok: true, value: 80.5 })
  })

  it('rejects junk and out-of-range values with the range in the user’s unit', () => {
    expect(parseBodyWeight('abc', 'kg').ok).toBe(false)
    expect(parseBodyWeight('10', 'kg')).toEqual({
      ok: false,
      error: 'Enter a weight between 20 and 400 kg.',
    })
    expect(parseBodyWeight('1000', 'lb')).toEqual({
      ok: false,
      error: 'Enter a weight between 44 and 882 lb.',
    })
  })
})

describe('parseHeight', () => {
  it('accepts cm', () => {
    expect(parseHeight(h('178'), 'cm')).toEqual({ ok: true, value: 178 })
  })

  it('accepts feet and inches, with inches optional', () => {
    expect(parseHeight(h('', '5', '10'), 'ft_in')).toEqual({ ok: true, value: 177.8 })
    expect(parseHeight(h('', '6', ''), 'ft_in')).toEqual({ ok: true, value: 182.9 })
  })

  it('rejects 12+ inches, fractional feet and out-of-range heights', () => {
    expect(parseHeight(h('', '5', '12'), 'ft_in').ok).toBe(false)
    expect(parseHeight(h('', '5.5', '0'), 'ft_in').ok).toBe(false)
    expect(parseHeight(h('90'), 'cm').ok).toBe(false)
    expect(parseHeight(h('', '9', '0'), 'ft_in').ok).toBe(false)
  })
})

describe('parseAge', () => {
  it('accepts whole years from 13 to 120', () => {
    expect(parseAge('30')).toEqual({ ok: true, value: 30 })
    for (const bad of ['12', '121', '30.5', 'x', '']) expect(parseAge(bad).ok).toBe(false)
  })
})
