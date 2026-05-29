export type DisplayControlsState = {
  showPerfDebug: boolean
  showHeightmap: boolean
  showControlsHint: boolean
  showWater: boolean
  waterOpacity: number
  waterDepthOpacityBoost: number
  waterReflection: number
  waterWaveSpeed: number
  waterWaveAmplitude: number
  waterWaveFrequency: number
}

export const DEFAULT_DISPLAY_STATE: DisplayControlsState = {
  showPerfDebug: true,
  showHeightmap: true,
  showControlsHint: true,
  showWater: true,
  waterOpacity: 0.26,
  waterDepthOpacityBoost: 0.56,
  waterReflection: 0.26,
  waterWaveSpeed: 1.1,
  waterWaveAmplitude: 0.55,
  waterWaveFrequency: 0.065,
}
