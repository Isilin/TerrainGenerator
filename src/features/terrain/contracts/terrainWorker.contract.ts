import type { TerrainGenerationSettings } from '../../../lib/terrain'

export type TerrainChunkRequest = {
  requestId: string
  streamRevision: number
  chunkX: number
  chunkZ: number
  settings: TerrainGenerationSettings
}

export type TerrainChunkResponse = {
  requestId: string
  streamRevision: number
  chunkId: string
  chunkX: number
  chunkZ: number
  heights: Float32Array
}
