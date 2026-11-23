import { describe, expect, it } from 'vitest'
import {
  cmToFtIn,
  formatHeight,
  formatNumber,
  formatWeight,
  ftInToCm,
  kgToLb,
  lbToKg,
  parsePositiveNumber,
  toDisplayWeight,
  toStoredKg,
} from './units'

describe('weight', () => {
  it('converts kg and lb both ways', () => {
    expect(kgToLb(1)).toBeCloseTo(2.20462, 5)
    expect(lbToKg(1)).toBe(0.45359237)
    expect(lbToKg(kgToLb(80))).toBeCloseTo(80, 10)
  })

  it('stores kg with 3 decimals so lb values round-trip exactly for display', () => {
    for (const lb of [45, 135, 225, 315, 405, 2.5, 177.2]) {
      const kg = toStoredKg(lb, 'lb')
      expect(formatNumber(toDisplayWeight(kg, 'lb'))).toBe(formatNumber(lb))
    }
    expect(toStoredKg(225, 'lb')).toBe(102.058)
    expect(toStoredKg(80.4, 'kg')).toBe(80.4)
  })

  it('formats in the chosen unit', () => {
    expect(formatWeight(80, 'kg')).toBe('80 kg')
    expect(formatWeight(80.44, 'kg')).toBe('80.4 kg')
    expect(formatWeight(100, 'lb')).toBe('220.5 lb')
    expect(formatWeight(102.058, 'lb')).toBe('225 lb')
  })
})

describe('height', () => {
  it('converts cm to feet and inches', () => {
    expect(cmToFtIn(175)).toEqual({ feet: 5, inches: 9 })
    expect(cmToFtIn(182.88)).toEqual({ feet: 6, inches: 0 })
    expect(cmToFtIn(152.4)).toEqual({ feet: 5, inches: 0 })
  })

  it('rolls 12 inches over to the next foot', () => {
    expect(cmToFtIn(182.5)).toEqual({ feet: 6, inches: 0 }) // 71.85 in rounds to 72
  })

  it('converts feet and inches to cm', () => {
    expect(ftInToCm({ feet: 5, inches: 9 })).toBe(175.3)
    expect(ftInToCm({ feet: 6, inches: 0 })).toBe(182.9)
    expect(cmToFtIn(ftInToCm({ feet: 5, inches: 11 }))).toEqual({ feet: 5, inches: 11 })
  })

  it('formats in the chosen unit', () => {
    expect(formatHeight(175, 'cm')).toBe('175 cm')
    expect(formatHeight(175.26, 'cm')).toBe('175.3 cm')
    expect(formatHeight(175, 'ft_in')).toBe('5 ft 9 in')
  })
})

describe('parsePositiveNumber', () => {
  it('accepts plain and comma decimals', () => {
    expect(parsePositiveNumber('80')).toBe(80)
    expect(parsePositiveNumber(' 80.5 ')).toBe(80.5)
    expect(parsePositiveNumber('80,5')).toBe(80.5)
  })

  it('rejects empty, negative, zero and junk', () => {
    for (const bad of ['', '-5', '0', 'abc', '1e3', '80kg', '.5']) {
      expect(parsePositiveNumber(bad)).toBeNull()
    }
  })
})

describe('formatNumber', () => {
  it('drops trailing zeros and avoids -0', () => {
    expect(formatNumber(80.0)).toBe('80')
    expect(formatNumber(80.25)).toBe('80.3')
    expect(formatNumber(-0.01)).toBe('0')
  })
})
