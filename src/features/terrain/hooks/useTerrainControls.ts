import { folder, useControls } from 'leva'
import { useMemo } from 'react'
import type { PostProcessSettings } from '../../../lib/filters'
import {
  LEGACY_CURVE_OPTIONS,
  LEGACY_EASING_OPTIONS,
  LEGACY_HEIGHTMAP_OPTIONS,
  LEGACY_SCATTERING_OPTIONS,
  LEGACY_SMOOTHING_OPTIONS,
  LEGACY_TEXTURE_OPTIONS,
  mapHeightmapToNoiseAlgorithm,
  mapSmoothingToPostProcess,
  type LegacyCurveOption,
  type LegacyEasingOption,
  type LegacyHeightmapOption,
  type LegacyScatteringOption,
  type LegacySmoothingOption,
  type LegacyTextureOption,
} from '../../../lib/legacy'
import { TERRAIN_PRESET_OPTIONS, TERRAIN_PRESETS } from '../config'
import type { GeneratorControlValues, TerrainPresetName } from '../types'

export const useTerrainControls = () => {
  const presetControls = useControls('Presets', {
    preset: {
      options: TERRAIN_PRESET_OPTIONS,
      value: 'Custom' as TerrainPresetName,
      label: 'Terrain preset',
    },
  })

  const controls = useControls('Generator', {
    Terrain: folder(
      {
        seed: { value: 'terrain-v2', label: 'Seed' },
        heightmap: {
          options: LEGACY_HEIGHTMAP_OPTIONS as unknown as string[],
          value: 'PerlinDiamond',
        },
        smoothing: {
          options: LEGACY_SMOOTHING_OPTIONS as unknown as string[],
          value: 'None',
        },
        texture: {
          options: LEGACY_TEXTURE_OPTIONS as unknown as string[],
          value: 'Blended',
        },
        curve: {
          options: LEGACY_CURVE_OPTIONS as unknown as string[],
          value: 'EaseInOut',
        },
        scattering: {
          options: LEGACY_SCATTERING_OPTIONS as unknown as string[],
          value: 'PerlinAltitude',
        },
        easing: {
          options: LEGACY_EASING_OPTIONS as unknown as string[],
          value: 'Linear',
        },
      },
      { collapsed: false },
    ),
    Noise: folder(
      {
        amplitude: { value: 24, min: 1, max: 80, step: 1 },
        frequency: { value: 0.012, min: 0.002, max: 0.08, step: 0.001 },
        octaves: { value: 5, min: 1, max: 8, step: 1 },
        persistence: { value: 0.5, min: 0.2, max: 0.8, step: 0.01 },
        lacunarity: { value: 2, min: 1.2, max: 3, step: 0.1 },
      },
      { collapsed: false },
    ),
    Streaming: folder(
      {
        chunkSize: { value: 140, min: 64, max: 280, step: 1 },
        chunkSegments: { value: 96, min: 16, max: 192, step: 1 },
        viewRadius: { value: 2, min: 1, max: 4, step: 1 },
        cacheSize: { value: 96, min: 16, max: 192, step: 1 },
        maxInFlight: { value: 8, min: 1, max: 24, step: 1 },
      },
      { collapsed: false },
    ),
    Render: folder(
      {
        wireframe: false,
      },
      { collapsed: true },
    ),
  })

  const activeControls = useMemo(() => {
    if (presetControls.preset === 'Custom') {
      return controls as GeneratorControlValues
    }

    return {
      ...(controls as GeneratorControlValues),
      ...TERRAIN_PRESETS[presetControls.preset],
    } as GeneratorControlValues
  }, [controls, presetControls.preset])

  const postProcess = useMemo<PostProcessSettings>(
    () => mapSmoothingToPostProcess(activeControls.smoothing as LegacySmoothingOption),
    [activeControls.smoothing],
  )

  const settings = useMemo(
    () => ({
      easing: activeControls.easing as LegacyEasingOption,
      seed: activeControls.seed,
      heightmap: activeControls.heightmap as LegacyHeightmapOption,
      noiseAlgorithm: mapHeightmapToNoiseAlgorithm(
        activeControls.heightmap as LegacyHeightmapOption,
      ),
      smoothing: activeControls.smoothing as LegacySmoothingOption,
      texture: activeControls.texture as LegacyTextureOption,
      scattering: activeControls.scattering as LegacyScatteringOption,
      curve: activeControls.curve as LegacyCurveOption,
      chunkSize: activeControls.chunkSize,
      chunkSegments: activeControls.chunkSegments,
      viewRadius: activeControls.viewRadius,
      amplitude: activeControls.amplitude,
      frequency: activeControls.frequency,
      octaves: activeControls.octaves,
      persistence: activeControls.persistence,
      lacunarity: activeControls.lacunarity,
      postProcess,
      cacheSize: activeControls.cacheSize,
      maxInFlight: activeControls.maxInFlight,
      wireframe: activeControls.wireframe,
    }),
    [activeControls, postProcess],
  )

  const terrainKey = useMemo(
    () =>
      JSON.stringify({
        easing: settings.easing,
        seed: settings.seed,
        heightmap: settings.heightmap,
        noiseAlgorithm: settings.noiseAlgorithm,
        smoothing: settings.smoothing,
        texture: settings.texture,
        scattering: settings.scattering,
        curve: settings.curve,
        chunkSize: settings.chunkSize,
        chunkSegments: settings.chunkSegments,
        amplitude: settings.amplitude,
        frequency: settings.frequency,
        octaves: settings.octaves,
        persistence: settings.persistence,
        lacunarity: settings.lacunarity,
        postProcess: settings.postProcess,
        cacheSize: settings.cacheSize,
        maxInFlight: settings.maxInFlight,
      }),
    [settings],
  )

  return {
    settings,
    terrainKey,
  }
}
