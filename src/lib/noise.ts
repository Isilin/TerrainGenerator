import { createNoise2D } from 'simplex-noise'

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
  const rng = mulberry32(hashSeed(seed))
  return createNoise2D(rng)
}
