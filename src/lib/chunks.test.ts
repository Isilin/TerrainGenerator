import { describe, expect, it } from 'vitest'
import { buildVisibleChunks } from './chunks'

describe('buildVisibleChunks', () => {
  it('returns center chunk first then nearest neighbors', () => {
    const chunks = buildVisibleChunks({ x: 0, z: 0 }, 1, (x, z) => `${x}:${z}`)

    expect(chunks[0].id).toBe('0:0')
    expect(chunks[0].distance).toBe(0)
    expect(chunks[1].distance).toBeLessThanOrEqual(chunks[2].distance)
    expect(chunks[chunks.length - 1].distance).toBeGreaterThanOrEqual(
      chunks[chunks.length - 2].distance,
    )
  })

  it('returns correct number of visible chunks for radius', () => {
    const radius = 3
    const chunks = buildVisibleChunks({ x: 5, z: -2 }, radius, (x, z) => `${x}:${z}`)
    expect(chunks).toHaveLength((radius * 2 + 1) ** 2)
  })
})
