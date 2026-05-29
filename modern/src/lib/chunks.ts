export type ChunkCoord = {
  x: number
  z: number
}

export type VisibleChunk = ChunkCoord & {
  id: string
  distance: number
}

export const buildVisibleChunks = (
  center: ChunkCoord,
  radius: number,
  createId: (x: number, z: number) => string,
): VisibleChunk[] => {
  const chunks: VisibleChunk[] = []

  for (let dz = -radius; dz <= radius; dz += 1) {
    for (let dx = -radius; dx <= radius; dx += 1) {
      const x = center.x + dx
      const z = center.z + dz
      chunks.push({
        x,
        z,
        id: createId(x, z),
        distance: Math.hypot(dx, dz),
      })
    }
  }

  chunks.sort((a, b) => {
    if (a.distance === b.distance) {
      if (a.z === b.z) {
        return a.x - b.x
      }
      return a.z - b.z
    }
    return a.distance - b.distance
  })

  return chunks
}
