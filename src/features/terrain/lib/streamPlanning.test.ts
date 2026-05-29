import { describe, expect, it } from 'vitest'
import { buildPlannedTerrainChunks, getLodStepForDistance } from './streamPlanning'

describe('terrain stream planning', () => {
  it('computes expected LOD rings from distance and view radius', () => {
    expect(getLodStepForDistance(0, 4)).toBe(1)
    expect(getLodStepForDistance(1, 4)).toBe(1)
    expect(getLodStepForDistance(2, 4)).toBe(2)
    expect(getLodStepForDistance(3, 4)).toBe(4)
    expect(getLodStepForDistance(4, 4)).toBe(8)

    expect(getLodStepForDistance(2, 2)).toBe(2)
  })

  it('prioritizes chunks by center-ring distance and keeps center first', () => {
    const chunks = buildPlannedTerrainChunks({ x: 0, z: 0 }, 2)

    expect(chunks[0]).toMatchObject({ x: 0, z: 0, priorityDistance: 0, lodStep: 1 })

    for (let i = 1; i < chunks.length; i += 1) {
      expect(chunks[i].priorityDistance).toBeGreaterThanOrEqual(chunks[i - 1].priorityDistance)
    }
  })
})
