import { describe, expect, it } from 'vitest'
import { createChunkGeometryFromHeights, type TerrainGenerationSettings } from './terrain'

const settings: TerrainGenerationSettings = {
  seed: 'seed',
  noiseAlgorithm: 'simplex',
  easing: 'Linear',
  scattering: 'Linear',
  curve: 'Linear',
  chunkSize: 10,
  chunkSegments: 1,
  amplitude: 10,
  frequency: 0.01,
  octaves: 2,
  persistence: 0.5,
  lacunarity: 2,
  postProcess: { mode: 'none' },
}

describe('terrain geometry colors', () => {
  it('creates color attribute for altitude mode', () => {
    const heights = new Float32Array([0, 1, 2, 3])
    const geometry = createChunkGeometryFromHeights(settings, heights, 'altitude')
    const color = geometry.getAttribute('color')
    expect(color).toBeDefined()
    expect(color.count).toBe(4)
  })

  it('creates color attribute for grayscale mode', () => {
    const heights = new Float32Array([0, 1, 2, 3])
    const geometry = createChunkGeometryFromHeights(settings, heights, 'grayscale')
    const color = geometry.getAttribute('color')
    expect(color).toBeDefined()
    expect(color.count).toBe(4)
  })
})
