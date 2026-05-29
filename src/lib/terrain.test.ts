import { describe, expect, it } from 'vitest'
import { createSeededNoise2D } from './noise'
import { generateChunkHeights, sampleHeightAtWorld } from './terrain'

const samplingSettings = {
  amplitude: 24,
  frequency: 0.012,
  octaves: 5,
  persistence: 0.5,
  lacunarity: 2,
}

const chunkSettings = {
  ...samplingSettings,
  seed: 'terrain-v2',
  chunkSize: 140,
  chunkSegments: 48,
  postProcess: { mode: 'none' as const },
}

describe('terrain sampling', () => {
  const assertSeamlessX = (left: Float32Array, right: Float32Array, side: number) => {
    for (let row = 0; row < side; row += 1) {
      const leftEdge = left[row * side + (side - 1)]
      const rightEdge = right[row * side]
      expect(leftEdge).toBeCloseTo(rightEdge, 6)
    }
  }

  it('returns deterministic values for a given seed', () => {
    const noiseA = createSeededNoise2D('seed-a')
    const noiseB = createSeededNoise2D('seed-a')

    const heightA = sampleHeightAtWorld(123.5, -77.25, noiseA, samplingSettings)
    const heightB = sampleHeightAtWorld(123.5, -77.25, noiseB, samplingSettings)

    expect(heightA).toBeCloseTo(heightB, 10)
  })

  it('changes output when seed changes', () => {
    const noiseA = createSeededNoise2D('seed-a')
    const noiseB = createSeededNoise2D('seed-b')

    const heightA = sampleHeightAtWorld(33.2, 190.1, noiseA, samplingSettings)
    const heightB = sampleHeightAtWorld(33.2, 190.1, noiseB, samplingSettings)

    expect(heightA).not.toBeCloseTo(heightB, 8)
  })

  it('keeps neighboring chunk borders seamless', () => {
    const left = generateChunkHeights(0, 0, chunkSettings)
    const right = generateChunkHeights(1, 0, chunkSettings)
    const side = chunkSettings.chunkSegments + 1
    assertSeamlessX(left, right, side)
  })

  it('keeps neighboring chunk borders seamless with mean smoothing', () => {
    const left = generateChunkHeights(0, 0, {
      ...chunkSettings,
      postProcess: { mode: 'mean', weight: 0 },
    })
    const right = generateChunkHeights(1, 0, {
      ...chunkSettings,
      postProcess: { mode: 'mean', weight: 0 },
    })
    const side = chunkSettings.chunkSegments + 1
    assertSeamlessX(left, right, side)
  })

  it('keeps neighboring chunk borders seamless with conservative smoothing', () => {
    const left = generateChunkHeights(0, 0, {
      ...chunkSettings,
      postProcess: { mode: 'conservative', multiplier: 1 },
    })
    const right = generateChunkHeights(1, 0, {
      ...chunkSettings,
      postProcess: { mode: 'conservative', multiplier: 1 },
    })
    const side = chunkSettings.chunkSegments + 1
    assertSeamlessX(left, right, side)
  })
})
