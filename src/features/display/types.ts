export type DisplayControlsState = {
  showPerfDebug: boolean
  showHeightmap: boolean
  showWater: boolean
  waterOpacity: number
  waterDepthOpacityBoost: number
  waterReflection: number
}

export const DEFAULT_DISPLAY_STATE: DisplayControlsState = {
  showPerfDebug: true,
  showHeightmap: true,
  showWater: true,
  waterOpacity: 0.26,
  waterDepthOpacityBoost: 0.56,
  waterReflection: 0.26,
}
