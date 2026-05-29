import type {
  LegacyCurveOption,
  LegacyEasingOption,
  LegacyHeightmapOption,
  LegacyScatteringOption,
  LegacySmoothingOption,
  LegacyTextureOption,
} from '../../lib/legacy'
import type { TerrainChunkSettings } from '../../lib/terrain'

export type PerfStats = {
  fps: number
  centerChunkX: number
  centerChunkZ: number
  visibleChunks: number
  loadedChunks: number
  inFlightRequests: number
  cacheSize: number
  lastChunkLatencyMs: number
  avgChunkLatencyMs: number
  staleResponsesDiscarded: number
}

export type HeightmapPreviewData = {
  heights: Float32Array
  side: number
}

export type GeneratorControlValues = {
  easing: LegacyEasingOption
  heightmap: LegacyHeightmapOption
  smoothing: LegacySmoothingOption
  texture: LegacyTextureOption
  scattering: LegacyScatteringOption
  curve: LegacyCurveOption
  seed: string
  chunkSize: number
  chunkSegments: number
  viewRadius: number
  amplitude: number
  frequency: number
  octaves: number
  persistence: number
  lacunarity: number
  cacheSize: number
  maxInFlight: number
  wireframe: boolean
}

export type TerrainPresetName =
  | 'Custom'
  | 'Archipelago'
  | 'AlpineRidges'
  | 'SoftDunes'
  | 'VolcanicPlateau'

export const initialPerfStats: PerfStats = {
  fps: 0,
  centerChunkX: 0,
  centerChunkZ: 0,
  visibleChunks: 0,
  loadedChunks: 0,
  inFlightRequests: 0,
  cacheSize: 0,
  lastChunkLatencyMs: 0,
  avgChunkLatencyMs: 0,
  staleResponsesDiscarded: 0,
}

export type TerrainChunkProps = {
  chunkX: number
  chunkZ: number
  heights: Float32Array | undefined
  settings: TerrainChunkSettings
  textureMode: LegacyTextureOption
  lodStep?: number
}

export type WaterChunkProps = {
  chunkX: number
  chunkZ: number
  heights: Float32Array | undefined
  settings: TerrainChunkSettings
  baseOpacity: number
  depthOpacityBoost: number
  reflectionStrength: number
  waveSpeed: number
  waveAmplitude: number
  waveFrequency: number
  lodStep?: number
}

export type InfiniteTerrainProps = {
  settings: TerrainChunkSettings
  onPerfUpdate: (stats: PerfStats) => void
  onHeightmapUpdate: (preview: HeightmapPreviewData | null) => void
  textureMode: LegacyTextureOption
  showWater: boolean
  waterOpacity: number
  waterDepthOpacityBoost: number
  waterReflection: number
  waterWaveSpeed: number
  waterWaveAmplitude: number
  waterWaveFrequency: number
}

export type TerrainSceneProps = {
  onPerfUpdate: (stats: PerfStats) => void
  onHeightmapUpdate: (preview: HeightmapPreviewData | null) => void
  showWater: boolean
  waterOpacity: number
  waterDepthOpacityBoost: number
  waterReflection: number
  waterWaveSpeed: number
  waterWaveAmplitude: number
  waterWaveFrequency: number
}
