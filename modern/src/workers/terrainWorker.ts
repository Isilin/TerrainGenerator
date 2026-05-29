/// <reference lib="webworker" />

import {
  createChunkId,
  generateChunkHeights,
  type TerrainGenerationSettings,
} from '../lib/terrain'

declare const self: DedicatedWorkerGlobalScope

type TerrainChunkRequest = {
  chunkX: number
  chunkZ: number
  settings: TerrainGenerationSettings
}

type TerrainChunkResponse = {
  chunkId: string
  chunkX: number
  chunkZ: number
  heights: Float32Array
}

self.onmessage = (event: MessageEvent<TerrainChunkRequest>) => {
  const { chunkX, chunkZ, settings } = event.data

  const heights = generateChunkHeights(chunkX, chunkZ, settings)
  const response: TerrainChunkResponse = {
    chunkId: createChunkId(chunkX, chunkZ),
    chunkX,
    chunkZ,
    heights,
  }

  self.postMessage(response, [heights.buffer])
}

export {}
