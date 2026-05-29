import { describe, expect, it } from 'vitest'
import {
  collectShareableQueryKeys,
  parseSceneUrlState,
  serializeSceneUrlState,
} from './sceneUrlState'

describe('sceneUrlState water controls', () => {
  it('parses advanced water wave controls from query string', () => {
    const state = parseSceneUrlState(
      '?terrain.waterWaveSpeed=1.75&terrain.waterWaveAmplitude=0.92&terrain.waterWaveFrequency=0.081',
    )

    expect(state.display).toBeDefined()
    expect(state.display?.waterWaveSpeed).toBeCloseTo(1.75)
    expect(state.display?.waterWaveAmplitude).toBeCloseTo(0.92)
    expect(state.display?.waterWaveFrequency).toBeCloseTo(0.081)
  })

  it('serializes advanced water wave controls into query string', () => {
    const query = serializeSceneUrlState({
      display: {
        showPerfDebug: true,
        showHeightmap: true,
        showWater: true,
        waterOpacity: 0.3,
        waterDepthOpacityBoost: 0.45,
        waterReflection: 0.6,
        waterWaveSpeed: 2,
        waterWaveAmplitude: 1.25,
        waterWaveFrequency: 0.11,
      },
    })

    expect(query).toContain('terrain.waterWaveSpeed=2')
    expect(query).toContain('terrain.waterWaveAmplitude=1.25')
    expect(query).toContain('terrain.waterWaveFrequency=0.11')
  })

  it('exposes water wave keys as shareable query keys', () => {
    const keys = collectShareableQueryKeys()

    expect(keys).toContain('waterWaveSpeed')
    expect(keys).toContain('waterWaveAmplitude')
    expect(keys).toContain('waterWaveFrequency')
  })
})
