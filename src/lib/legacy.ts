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
