import { buildVisibleChunks } from '../../../lib/chunks'
import { createChunkId } from '../../../lib/terrain'

export type PlannedTerrainChunk = {
  id: string
  x: number
  z: number
  priorityDistance: number
  lodStep: number
}

export const getLodStepForDistance = (distance: number, viewRadius: number) => {
  const nearRing = 1
  const midRing = Math.min(2, viewRadius)
  const farRing = Math.min(3, viewRadius)

  if (distance <= nearRing) {
    return 1
  }
  if (distance <= midRing) {
    return 2
  }
  if (distance <= farRing) {
    return 4
  }
  return 8
}

export const buildPlannedTerrainChunks = (centerChunk: { x: number; z: number }, viewRadius: number) => {
  const chunks = buildVisibleChunks(centerChunk, viewRadius, createChunkId).map((chunk) => {
    const priorityDistance = Math.max(
      Math.abs(chunk.x - centerChunk.x),
      Math.abs(chunk.z - centerChunk.z),
    )

    return {
      id: chunk.id,
      x: chunk.x,
      z: chunk.z,
      priorityDistance,
      lodStep: getLodStepForDistance(priorityDistance, viewRadius),
    }
  })

  chunks.sort((a, b) => {
    if (a.priorityDistance !== b.priorityDistance) {
      return a.priorityDistance - b.priorityDistance
    }
    if (a.z !== b.z) {
      return a.z - b.z
    }
    return a.x - b.x
  })

  return chunks
}
