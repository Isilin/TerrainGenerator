/// <reference lib="webworker" />

import {
  createChunkId,
  generateChunkHeights,
} from '../lib/terrain'
import type {
  TerrainChunkRequest,
  TerrainChunkResponse,
} from '../features/terrain/contracts/terrainWorker.contract'

declare const self: DedicatedWorkerGlobalScope

self.onmessage = (event: MessageEvent<TerrainChunkRequest>) => {
  const { requestId, streamRevision, chunkX, chunkZ, settings } = event.data

  const heights = generateChunkHeights(chunkX, chunkZ, settings)
  const response: TerrainChunkResponse = {
    requestId,
    streamRevision,
    chunkId: createChunkId(chunkX, chunkZ),
    chunkX,
    chunkZ,
    heights,
  }

  self.postMessage(response, [heights.buffer])
}

export {}
