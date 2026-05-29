import { createNoise2D } from 'simplex-noise'

export type NoiseAlgorithm = 'simplex' | 'value' | 'cellular'

export const hashSeed = (input: string) => {
  let hash = 1779033703 ^ input.length
  for (let i = 0; i < input.length; i += 1) {
    hash = Math.imul(hash ^ input.charCodeAt(i), 3432918353)
    hash = (hash << 13) | (hash >>> 19)
  }
  return hash >>> 0
}

export const mulberry32 = (seed: number) => {
  return () => {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const createSeededNoise2D = (seed: string) => {
  return createNoiseSampler2D(seed, 'simplex')
}

const smoothstep = (t: number) => t * t * (3 - 2 * t)

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

const hash2D = (x: number, y: number, seedHash: number) => {
  let h = seedHash ^ Math.imul(x, 374761393) ^ Math.imul(y, 668265263)
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

const createValueNoise2D = (seedHash: number) => {
  return (x: number, y: number) => {
    const x0 = Math.floor(x)
    const y0 = Math.floor(y)
    const x1 = x0 + 1
    const y1 = y0 + 1

    const tx = smoothstep(x - x0)
    const ty = smoothstep(y - y0)

    const n00 = hash2D(x0, y0, seedHash) * 2 - 1
    const n10 = hash2D(x1, y0, seedHash) * 2 - 1
    const n01 = hash2D(x0, y1, seedHash) * 2 - 1
    const n11 = hash2D(x1, y1, seedHash) * 2 - 1

    const nx0 = lerp(n00, n10, tx)
    const nx1 = lerp(n01, n11, tx)
    return lerp(nx0, nx1, ty)
  }
}

const createCellularNoise2D = (seedHash: number) => {
  return (x: number, y: number) => {
    const cellX = Math.floor(x)
    const cellY = Math.floor(y)
    let minDistSq = Number.POSITIVE_INFINITY

    for (let oy = -1; oy <= 1; oy += 1) {
      for (let ox = -1; ox <= 1; ox += 1) {
        const gx = cellX + ox
        const gy = cellY + oy
        const fx = gx + hash2D(gx, gy, seedHash)
        const fy = gy + hash2D(gx, gy, seedHash ^ 0x9e3779b9)
        const dx = x - fx
        const dy = y - fy
        const distSq = dx * dx + dy * dy
        if (distSq < minDistSq) {
          minDistSq = distSq
        }
      }
    }

    const normalized = 1 - Math.min(1, Math.sqrt(minDistSq) / Math.SQRT2)
    return normalized * 2 - 1
  }
}

export const createNoiseSampler2D = (seed: string, algorithm: NoiseAlgorithm) => {
  const seedHash = hashSeed(seed)
  if (algorithm === 'simplex') {
    return createNoise2D(mulberry32(seedHash))
  }
  if (algorithm === 'value') {
    return createValueNoise2D(seedHash)
  }
  return createCellularNoise2D(seedHash)
}
