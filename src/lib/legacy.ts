import type { PostProcessSettings } from './filters'
import type { NoiseAlgorithm } from './noise'

export const LEGACY_EASING_OPTIONS = [
  'Linear',
  'Easeln',
  'EalsenWeak',
  'EaseOut',
  'EaseInOut',
  'InEaseOut',
] as const

export const LEGACY_HEIGHTMAP_OPTIONS = [
  'Brownian',
  'Cosine',
  'CosineLayers',
  'DiamondSquare',
  'Fault',
  'Heightmap.png',
  'Hill',
  'Hillsland',
  'Particles',
  'Perlin',
  'PerlinDiamond',
  'PerlinLayers',
  'Simplex',
  'SimplexLayers',
  'Value',
  'Weierstrass',
  'Worley',
] as const

export const LEGACY_SMOOTHING_OPTIONS = [
  'Conservative (0.5)',
  'Conservative (1)',
  'Conservative (10)',
  'Gaussian (0.5, 7)',
  'Gaussian (1.0, 7)',
  'Gaussian (1.5, 7)',
  'Gaussian (1.0, 5)',
  'Gaussian (1.0, 11)',
  'GaussianBox',
  'Mean (0)',
  'Mean (1)',
  'Mean (8)',
  'Median',
  'None',
] as const

export const LEGACY_TEXTURE_OPTIONS = ['Blended', 'Grayscale'] as const

export const LEGACY_SCATTERING_OPTIONS = [
  'Altitude',
  'Linear',
  'Cosine',
  'CosineLayers',
  'DiamondSquare',
  'Particles',
  'Perlin',
  'PerlinAltitude',
  'Simplex',
  'Value',
  'Weierstrass',
  'Worley',
] as const

export const LEGACY_CURVE_OPTIONS = ['Linear', 'EaseIn', 'EaseOut', 'EaseInOut'] as const

export type LegacyEasingOption = (typeof LEGACY_EASING_OPTIONS)[number]
export type LegacyHeightmapOption = (typeof LEGACY_HEIGHTMAP_OPTIONS)[number]
export type LegacySmoothingOption = (typeof LEGACY_SMOOTHING_OPTIONS)[number]
export type LegacyTextureOption = (typeof LEGACY_TEXTURE_OPTIONS)[number]
export type LegacyScatteringOption = (typeof LEGACY_SCATTERING_OPTIONS)[number]
export type LegacyCurveOption = (typeof LEGACY_CURVE_OPTIONS)[number]

const clamp01 = (value: number) => Math.max(0, Math.min(1, value))

export const mapLegacyEasingFunction = (option: LegacyEasingOption) => {
  if (option === 'EaseOut') {
    return (t: number) => 1 - (1 - clamp01(t)) * (1 - clamp01(t))
  }
  if (option === 'EaseInOut') {
    return (t: number) => {
      const x = clamp01(t)
      return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) * 0.5
    }
  }
  if (option === 'InEaseOut') {
    return (t: number) => {
      const x = clamp01(t)
      return x * x * x * (x * (x * 6 - 15) + 10)
    }
  }
  if (option === 'Easeln') {
    return (t: number) => {
      const x = clamp01(t)
      return Math.log1p(4 * x) / Math.log(5)
    }
  }
  if (option === 'EalsenWeak') {
    return (t: number) => {
      const x = clamp01(t)
      return Math.log1p(2 * x) / Math.log(3)
    }
  }
  return (t: number) => clamp01(t)
}

export const mapLegacyCurveFunction = (option: LegacyCurveOption) => {
  if (option === 'EaseIn') {
    return (t: number) => {
      const x = clamp01(t)
      return x * x
    }
  }
  if (option === 'EaseOut') {
    return (t: number) => {
      const x = clamp01(t)
      return 1 - (1 - x) * (1 - x)
    }
  }
  if (option === 'EaseInOut') {
    return (t: number) => {
      const x = clamp01(t)
      return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) * 0.5
    }
  }
  return (t: number) => clamp01(t)
}

export type ScatteringDescriptor = {
  algorithm: NoiseAlgorithm
  strength: number
  altitudeAware: boolean
}

export const mapLegacyScattering = (
  option: LegacyScatteringOption,
): ScatteringDescriptor => {
  switch (option) {
    case 'Linear':
      return { algorithm: 'simplex', strength: 0, altitudeAware: false }
    case 'Altitude':
      return { algorithm: 'value', strength: 0.18, altitudeAware: true }
    case 'PerlinAltitude':
      return { algorithm: 'simplex', strength: 0.26, altitudeAware: true }
    case 'Value':
      return { algorithm: 'value', strength: 0.2, altitudeAware: false }
    case 'Worley':
      return { algorithm: 'cellular', strength: 0.24, altitudeAware: false }
    case 'Particles':
      return { algorithm: 'cellular', strength: 0.28, altitudeAware: false }
    case 'Cosine':
    case 'CosineLayers':
      return { algorithm: 'value', strength: 0.14, altitudeAware: false }
    case 'DiamondSquare':
    case 'Weierstrass':
      return { algorithm: 'simplex', strength: 0.22, altitudeAware: false }
    case 'Perlin':
    case 'Simplex':
      return { algorithm: 'simplex', strength: 0.2, altitudeAware: false }
    default:
      return { algorithm: 'simplex', strength: 0.18, altitudeAware: false }
  }
}

export const mapHeightmapToNoiseAlgorithm = (
  heightmap: LegacyHeightmapOption,
): NoiseAlgorithm => {
  if (heightmap === 'Value') {
    return 'value'
  }
  if (heightmap === 'Worley') {
    return 'cellular'
  }
  return 'simplex'
}

export const mapSmoothingToPostProcess = (
  smoothing: LegacySmoothingOption,
): PostProcessSettings => {
  if (smoothing === 'None') {
    return { mode: 'none' }
  }
  if (smoothing === 'Median') {
    return { mode: 'median' }
  }
  if (smoothing === 'GaussianBox') {
    return { mode: 'gaussianBox' }
  }

  if (smoothing.startsWith('Mean')) {
    const value = Number(smoothing.match(/\(([^)]+)\)/)?.[1] ?? 0)
    return { mode: 'mean', weight: value }
  }

  if (smoothing.startsWith('Conservative')) {
    const value = Number(smoothing.match(/\(([^)]+)\)/)?.[1] ?? 1)
    return { mode: 'conservative', multiplier: value }
  }

  if (smoothing.startsWith('Gaussian')) {
    const match = smoothing.match(/\(([^,]+),\s*([^)]+)\)/)
    const sigma = Number(match?.[1] ?? 1)
    const kernelSize = Number(match?.[2] ?? 7)
    return { mode: 'gaussian', sigma, kernelSize }
  }

  return { mode: 'none' }
}
