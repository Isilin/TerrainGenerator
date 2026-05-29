import { BufferAttribute, PlaneGeometry } from 'three'
import { applyPostProcess, type PostProcessSettings } from './filters'
import { createSeededNoise2D } from './noise'

export type TerrainSamplingSettings = {
  amplitude: number
  frequency: number
  octaves: number
  persistence: number
  lacunarity: number
}

export type TerrainGenerationSettings = TerrainSamplingSettings & {
  seed: string
  chunkSize: number
  chunkSegments: number
  postProcess: PostProcessSettings
}

export type TerrainChunkSettings = TerrainGenerationSettings & {
  viewRadius: number
  wireframe: boolean
  cacheSize: number
  maxInFlight: number
}

export const createChunkId = (x: number, z: number) => `${x}:${z}`

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

const getPostProcessPadding = (settings: TerrainGenerationSettings) => {
  return settings.postProcess.mode === 'none' ? 0 : 1
}

const cropCenterGrid = (
  source: Float32Array,
  sourceSide: number,
  targetSide: number,
  padding: number,
) => {
  if (padding === 0) {
    return source
  }

  const target = new Float32Array(targetSide * targetSide)
  for (let row = 0; row < targetSide; row += 1) {
    const sourceStart = (row + padding) * sourceSide + padding
    const targetStart = row * targetSide
    target.set(source.subarray(sourceStart, sourceStart + targetSide), targetStart)
  }
  return target
}

export const generateChunkHeights = (
  chunkX: number,
  chunkZ: number,
  settings: TerrainGenerationSettings,
) => {
  const noise2d = createSeededNoise2D(settings.seed)
  const vertexCountPerSide = settings.chunkSegments + 1
  const padding = getPostProcessPadding(settings)
  const sampledSide = vertexCountPerSide + padding * 2
  const step = settings.chunkSize / settings.chunkSegments
  const half = settings.chunkSize * 0.5 + padding * step
  const heights = new Float32Array(sampledSide * sampledSide)
  const chunkOffsetX = chunkX * settings.chunkSize
  const chunkOffsetZ = chunkZ * settings.chunkSize

  for (let row = 0; row < sampledSide; row += 1) {
    const localZ = -half + row * step
    for (let col = 0; col < sampledSide; col += 1) {
      const localX = -half + col * step
      const index = row * sampledSide + col
      heights[index] = sampleHeightAtWorld(
        localX + chunkOffsetX,
        localZ + chunkOffsetZ,
        noise2d,
        settings,
      )
    }
  }

  const processed = applyPostProcess(
    heights,
    { width: sampledSide, height: sampledSide },
    settings.postProcess,
  )

  return cropCenterGrid(processed, sampledSide, vertexCountPerSide, padding)
}

export const createChunkGeometryFromHeights = (
  settings: TerrainGenerationSettings,
  heights: Float32Array,
) => {
  const geometry = new PlaneGeometry(
    settings.chunkSize,
    settings.chunkSize,
    settings.chunkSegments,
    settings.chunkSegments,
  )

  const position = geometry.getAttribute('position') as BufferAttribute
  for (let i = 0; i < position.count; i += 1) {
    position.setZ(i, heights[i])
  }

  position.needsUpdate = true
  geometry.rotateX(-Math.PI / 2)
  geometry.computeVertexNormals()
  return geometry
}

export const createChunkGeometry = (
  chunkX: number,
  chunkZ: number,
  settings: TerrainGenerationSettings,
) => {
  const heights = generateChunkHeights(chunkX, chunkZ, settings)
  return createChunkGeometryFromHeights(settings, heights)
}
