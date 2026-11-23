import { describe, expect, it } from 'vitest'
import { computeBox } from './image-compress'

describe('computeBox', () => {
  it('scales the longest side down to maxSize and keeps the aspect ratio', () => {
    expect(computeBox(4000, 3000, { maxSize: 1600 })).toEqual({
      sx: 0,
      sy: 0,
      sw: 4000,
      sh: 3000,
      width: 1600,
      height: 1200,
    })
  })

  it('never upscales small images', () => {
    expect(computeBox(800, 600, { maxSize: 1600 })).toMatchObject({ width: 800, height: 600 })
  })

  it('crops a centred square for avatars', () => {
    expect(computeBox(3000, 4000, { maxSize: 512, square: true })).toEqual({
      sx: 0,
      sy: 500,
      sw: 3000,
      sh: 3000,
      width: 512,
      height: 512,
    })
  })
})
