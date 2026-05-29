import { describe, expect, it } from 'vitest'
import {
  applyPostProcess,
  clampHeights,
  smoothConservative,
  smoothMean,
  smoothMedian,
} from './filters'

const options = { width: 3, height: 3 }

const toArray = (input: Float32Array) => Array.from(input)

describe('filters', () => {
  it('mean smoothing reduces center spike', () => {
    const heights = new Float32Array([
      0, 0, 0,
      0, 9, 0,
      0, 0, 0,
    ])

    const smoothed = smoothMean(heights, options, 0)
    expect(smoothed[4]).toBeLessThan(9)
    expect(smoothed[4]).toBeGreaterThan(0)
  })

  it('median smoothing removes isolated spike', () => {
    const heights = new Float32Array([
      0, 0, 0,
      0, 9, 0,
      0, 0, 0,
    ])

    const smoothed = smoothMedian(heights, options)
    expect(smoothed[4]).toBe(0)
  })

  it('conservative smoothing clamps outlier', () => {
    const heights = new Float32Array([
      2, 2, 2,
      2, 100, 2,
      2, 2, 2,
    ])

    const smoothed = smoothConservative(heights, options, 1)
    expect(smoothed[4]).toBe(2)
  })

  it('clamp rescales values to target range', () => {
    const heights = new Float32Array([0, 5, 10])
    const clamped = clampHeights(heights, -1, 1)

    expect(clamped[0]).toBeCloseTo(-1, 6)
    expect(clamped[1]).toBeCloseTo(0, 6)
    expect(clamped[2]).toBeCloseTo(1, 6)
  })

  it('applyPostProcess returns expected mode outputs', () => {
    const heights = new Float32Array([
      0, 0, 0,
      0, 9, 0,
      0, 0, 0,
    ])

    const none = applyPostProcess(heights, options, { mode: 'none' })
    const mean = applyPostProcess(heights, options, { mode: 'mean', weight: 0 })

    expect(toArray(none)).toEqual(toArray(heights))
    expect(mean[4]).toBeLessThan(heights[4])
  })
})
