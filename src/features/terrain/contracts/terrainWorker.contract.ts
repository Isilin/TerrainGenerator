import type { TerrainGenerationSettings } from '../../../lib/terrain'

export type TerrainChunkRequest = {
  chunkX: number
  chunkZ: number
  settings: TerrainGenerationSettings
}

export type TerrainChunkResponse = {
  chunkId: string
  chunkX: number
  chunkZ: number
  heights: Float32Array
}
