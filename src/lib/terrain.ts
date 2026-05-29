import { BufferAttribute, Color, Float32BufferAttribute, PlaneGeometry } from 'three'
import { applyPostProcess, type PostProcessSettings } from './filters'
import {
  mapLegacyCurveFunction,
  mapLegacyEasingFunction,
  mapLegacyScattering,
  type LegacyCurveOption,
  type LegacyEasingOption,
  type LegacyScatteringOption,
} from './legacy'
import { createNoiseSampler2D, type NoiseAlgorithm } from './noise'

export type TerrainSamplingSettings = {
  amplitude: number
  frequency: number
  octaves: number
  persistence: number
  lacunarity: number
}

export type TerrainGenerationSettings = TerrainSamplingSettings & {
  seed: string
  noiseAlgorithm: NoiseAlgorithm
  easing: LegacyEasingOption
  scattering: LegacyScatteringOption
  curve: LegacyCurveOption
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

export type TerrainColorMode = 'none' | 'grayscale' | 'altitude'

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
  const noise2d = createNoiseSampler2D(settings.seed, settings.noiseAlgorithm)
  const scatteringDescriptor = mapLegacyScattering(settings.scattering)
  const scatterNoise2d = createNoiseSampler2D(
    `${settings.seed}:${settings.scattering}`,
    scatteringDescriptor.algorithm,
  )
  const easingFn = mapLegacyEasingFunction(settings.easing)
  const curveFn = mapLegacyCurveFunction(settings.curve)
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
      const baseHeight = sampleHeightAtWorld(
        localX + chunkOffsetX,
        localZ + chunkOffsetZ,
        noise2d,
        settings,
      )

      const scatterSample = scatterNoise2d(
        (localX + chunkOffsetX) * settings.frequency,
        (localZ + chunkOffsetZ) * settings.frequency,
      )
      const altitudeFactor = scatteringDescriptor.altitudeAware
        ? Math.max(0, Math.min(1, (baseHeight / Math.max(1e-6, settings.amplitude) + 1) * 0.5))
        : 1
      const scatterDelta =
        scatterSample * settings.amplitude * scatteringDescriptor.strength * altitudeFactor

      const edgeDistance =
        1 -
        Math.max(
          Math.min(1, Math.abs(localX) / (settings.chunkSize * 0.5 + padding * step)),
          Math.min(1, Math.abs(localZ) / (settings.chunkSize * 0.5 + padding * step)),
        )
      const curveFactor = 0.85 + curveFn(edgeDistance) * 0.3

      heights[index] = (baseHeight + scatterDelta) * curveFactor
    }
  }

  const processed = applyPostProcess(
    heights,
    { width: sampledSide, height: sampledSide },
    settings.postProcess,
  )

  const eased = processed
  const maxAbsInput = Math.max(
    1e-6,
    settings.amplitude * (1 + scatteringDescriptor.strength) * 1.3,
  )

  for (let i = 0; i < eased.length; i += 1) {
    const normalized = Math.max(0, Math.min(1, (eased[i] + maxAbsInput) / (2 * maxAbsInput)))
    eased[i] = (easingFn(normalized) * 2 - 1) * settings.amplitude
  }

  return cropCenterGrid(eased, sampledSide, vertexCountPerSide, padding)
}

export const createChunkGeometryFromHeights = (
  settings: TerrainGenerationSettings,
  heights: Float32Array,
  colorMode: TerrainColorMode = 'none',
  lodStep = 1,
) => {
  const sourceSegments = settings.chunkSegments
  const targetSegments = Math.max(1, Math.floor(sourceSegments / Math.max(1, lodStep)))
  const sourceSide = sourceSegments + 1
  const targetSide = targetSegments + 1

  const sampledHeights =
    targetSegments === sourceSegments
      ? heights
      : (() => {
          const out = new Float32Array(targetSide * targetSide)
          for (let row = 0; row < targetSide; row += 1) {
            const sourceRow = Math.round((row / (targetSide - 1)) * (sourceSide - 1))
            for (let col = 0; col < targetSide; col += 1) {
              const sourceCol = Math.round((col / (targetSide - 1)) * (sourceSide - 1))
              out[row * targetSide + col] = heights[sourceRow * sourceSide + sourceCol]
            }
          }
          return out
        })()

  const geometry = new PlaneGeometry(
    settings.chunkSize,
    settings.chunkSize,
    targetSegments,
    targetSegments,
  )

  const position = geometry.getAttribute('position') as BufferAttribute
  for (let i = 0; i < position.count; i += 1) {
    position.setZ(i, sampledHeights[i])
  }

  if (colorMode !== 'none') {
    let min = Number.POSITIVE_INFINITY
    let max = Number.NEGATIVE_INFINITY
    for (let i = 0; i < sampledHeights.length; i += 1) {
      const value = sampledHeights[i]
      if (value < min) min = value
      if (value > max) max = value
    }

    const range = max - min || 1
    const colors = new Float32Array(position.count * 3)

    for (let i = 0; i < position.count; i += 1) {
      const normalized = Math.max(0, Math.min(1, (sampledHeights[i] - min) / range))
      let color: Color

      if (colorMode === 'grayscale') {
        color = new Color(normalized, normalized, normalized)
      } else if (normalized < 0.24) {
        color = new Color('#2f6690')
      } else if (normalized < 0.38) {
        color = new Color('#9b7653')
      } else if (normalized < 0.72) {
        color = new Color('#588157')
      } else if (normalized < 0.9) {
        color = new Color('#6b705c')
      } else {
        color = new Color('#f8f9fa')
      }

      const offset = i * 3
      colors[offset] = color.r
      colors[offset + 1] = color.g
      colors[offset + 2] = color.b
    }

    geometry.setAttribute('color', new Float32BufferAttribute(colors, 3))
  }

  position.needsUpdate = true
  geometry.rotateX(-Math.PI / 2)
  geometry.computeVertexNormals()
  return geometry
}

export const createWaterGeometryFromHeights = (
  settings: TerrainGenerationSettings,
  heights: Float32Array,
  options?: {
    waterLevel?: number
    surfaceLift?: number
    maxDepthForOpacity?: number
    lodStep?: number
  },
) => {
  const waterLevel = options?.waterLevel ?? 0
  const surfaceLift = options?.surfaceLift ?? 0.08
  const maxDepthForOpacity = options?.maxDepthForOpacity ?? Math.max(1, settings.amplitude)
  const lodStep = options?.lodStep ?? 1

  const sourceSegments = settings.chunkSegments
  const targetSegments = Math.max(1, Math.floor(sourceSegments / Math.max(1, lodStep)))
  const sourceSide = sourceSegments + 1
  const targetSide = targetSegments + 1

  const sampledHeights =
    targetSegments === sourceSegments
      ? heights
      : (() => {
          const out = new Float32Array(targetSide * targetSide)
          for (let row = 0; row < targetSide; row += 1) {
            const sourceRow = Math.round((row / (targetSide - 1)) * (sourceSide - 1))
            for (let col = 0; col < targetSide; col += 1) {
              const sourceCol = Math.round((col / (targetSide - 1)) * (sourceSide - 1))
              out[row * targetSide + col] = heights[sourceRow * sourceSide + sourceCol]
            }
          }
          return out
        })()

  const geometry = new PlaneGeometry(
    settings.chunkSize,
    settings.chunkSize,
    targetSegments,
    targetSegments,
  )

  const position = geometry.getAttribute('position') as BufferAttribute
  const depthFactor = new Float32Array(position.count)

  for (let i = 0; i < position.count; i += 1) {
    const depth = Math.max(0, waterLevel - sampledHeights[i])
    depthFactor[i] = Math.max(0, Math.min(1, depth / maxDepthForOpacity))
    position.setZ(i, waterLevel + surfaceLift)
  }

  geometry.setAttribute('depthFactor', new Float32BufferAttribute(depthFactor, 1))

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
