import { BufferAttribute, PlaneGeometry } from 'three'
import { createSeededNoise2D } from './noise'

export type TerrainSamplingSettings = {
  amplitude: number
  frequency: number
  octaves: number
  persistence: number
  lacunarity: number
}

export type TerrainChunkSettings = TerrainSamplingSettings & {
  seed: string
  chunkSize: number
  chunkSegments: number
  viewRadius: number
  wireframe: boolean
}

export const sampleHeightAtWorld = (
  x: number,
  z: number,
  noise2d: (x: number, y: number) => number,
  settings: TerrainSamplingSettings,
) => {
  let value = 0
  let amplitude = 1
  let frequency = settings.frequency
  for (let octave = 0; octave < settings.octaves; octave += 1) {
    value += noise2d(x * frequency, z * frequency) * amplitude
    amplitude *= settings.persistence
    frequency *= settings.lacunarity
  }
  return value * settings.amplitude
}

export const createChunkGeometry = (
  chunkX: number,
  chunkZ: number,
  settings: TerrainChunkSettings,
) => {
  const noise2d = createSeededNoise2D(settings.seed)
  const geometry = new PlaneGeometry(
    settings.chunkSize,
    settings.chunkSize,
    settings.chunkSegments,
    settings.chunkSegments,
  )

  geometry.rotateX(-Math.PI / 2)

  const position = geometry.getAttribute('position') as BufferAttribute
  const chunkOffsetX = chunkX * settings.chunkSize
  const chunkOffsetZ = chunkZ * settings.chunkSize

  for (let i = 0; i < position.count; i += 1) {
    const localX = position.getX(i)
    const localZ = position.getZ(i)
    const height = sampleHeightAtWorld(
      localX + chunkOffsetX,
      localZ + chunkOffsetZ,
      noise2d,
      settings,
    )
    position.setY(i, height)
  }

  position.needsUpdate = true
  geometry.computeVertexNormals()
  return geometry
}
