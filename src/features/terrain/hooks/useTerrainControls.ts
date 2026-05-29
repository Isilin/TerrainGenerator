import { button, folder, useControls } from 'leva'
import { useEffect, useMemo, useRef, useState } from 'react'
import { DISPLAY_STORAGE_KEY, TERRAIN_STORAGE_KEY } from '../../shared/persistenceKeys'
import { parseSceneUrlState, serializeSceneUrlState } from '../../shared/sceneUrlState'
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

type PersistedTerrainState = {
  preset?: TerrainPresetName
  controls?: Partial<GeneratorControlValues>
}

type PersistedDisplayState = {
  showPerfDebug?: boolean
  showHeightmap?: boolean
  showWater?: boolean
  waterOpacity?: number
  waterDepthOpacityBoost?: number
  waterReflection?: number
}

type ExportedProfilePayload = {
  version: 1
  terrain: PersistedTerrainState
  display?: PersistedDisplayState
}

const loadPersistedTerrainState = (): PersistedTerrainState => {
  if (typeof window === 'undefined') {
    return {}
  }

  const raw = window.localStorage.getItem(TERRAIN_STORAGE_KEY)
  if (raw === null) {
    return {}
  }

  try {
    const parsed = JSON.parse(raw) as PersistedTerrainState
    return parsed ?? {}
  } catch {
    return {}
  }
}

const hasTerrainControlChanged = (
  previous: GeneratorControlValues,
  next: GeneratorControlValues,
) => {
  for (const key of Object.keys(previous) as Array<keyof GeneratorControlValues>) {
    if (previous[key] !== next[key]) {
      return true
    }
  }
  return false
}

export const useTerrainControls = () => {
  const persistedState = useMemo(() => loadPersistedTerrainState(), [])
  const urlState = useMemo(() => {
    if (typeof window === 'undefined') {
      return {}
    }

    return parseSceneUrlState(window.location.search)
  }, [])
  const urlTerrainState = urlState.terrain

  const presetControls = useControls('Presets', {
    preset: {
      options: TERRAIN_PRESET_OPTIONS,
      value: urlTerrainState?.preset ?? persistedState.preset ?? ('Custom' as TerrainPresetName),
      label: 'Terrain preset',
    },
  })

  const handleExportProfile = () => {
    if (typeof window === 'undefined') {
      return
    }

    const displayRaw = window.localStorage.getItem(DISPLAY_STORAGE_KEY)
    const display = displayRaw !== null ? (JSON.parse(displayRaw) as PersistedDisplayState) : undefined

    const payload: ExportedProfilePayload = {
      version: 1,
      terrain: {
        preset: effectivePreset,
        controls: controls as GeneratorControlValues,
      },
      display,
    }

    const json = JSON.stringify(payload, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'terrain-profile.json'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const handleImportProfile = () => {
    if (typeof window === 'undefined') {
      return
    }

    const raw = window.prompt('Paste terrain profile JSON')
    if (raw === null || raw.trim() === '') {
      return
    }

    try {
      const payload = JSON.parse(raw) as ExportedProfilePayload
      if (payload.terrain !== undefined) {
        window.localStorage.setItem(TERRAIN_STORAGE_KEY, JSON.stringify(payload.terrain))
      }
      if (payload.display !== undefined) {
        window.localStorage.setItem(DISPLAY_STORAGE_KEY, JSON.stringify(payload.display))
      }
      window.location.reload()
    } catch {
      window.alert('Invalid profile JSON')
    }
  }

  const handleResetDefaults = () => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.removeItem(TERRAIN_STORAGE_KEY)
    window.localStorage.removeItem(DISPLAY_STORAGE_KEY)
    window.location.reload()
  }

  useControls('Presets', {
    profileActions: folder(
      {
        exportProfile: button(handleExportProfile),
        importProfile: button(handleImportProfile),
        resetDefaults: button(handleResetDefaults),
      },
      { collapsed: true },
    ),
  })

  const controls = useControls('Generator', {
    Terrain: folder(
      {
        seed: {
          value: urlTerrainState?.seed ?? persistedState.controls?.seed ?? 'terrain-v2',
          label: 'Seed',
        },
        heightmap: {
          options: LEGACY_HEIGHTMAP_OPTIONS as unknown as string[],
          value: urlTerrainState?.heightmap ?? persistedState.controls?.heightmap ?? 'PerlinDiamond',
        },
        smoothing: {
          options: LEGACY_SMOOTHING_OPTIONS as unknown as string[],
          value: urlTerrainState?.smoothing ?? persistedState.controls?.smoothing ?? 'None',
        },
        texture: {
          options: LEGACY_TEXTURE_OPTIONS as unknown as string[],
          value: urlTerrainState?.texture ?? persistedState.controls?.texture ?? 'Blended',
        },
        curve: {
          options: LEGACY_CURVE_OPTIONS as unknown as string[],
          value: urlTerrainState?.curve ?? persistedState.controls?.curve ?? 'EaseInOut',
        },
        scattering: {
          options: LEGACY_SCATTERING_OPTIONS as unknown as string[],
          value: urlTerrainState?.scattering ?? persistedState.controls?.scattering ?? 'PerlinAltitude',
        },
        easing: {
          options: LEGACY_EASING_OPTIONS as unknown as string[],
          value: urlTerrainState?.easing ?? persistedState.controls?.easing ?? 'Linear',
        },
      },
      { collapsed: false },
    ),
    Noise: folder(
      {
        amplitude: {
          value: urlTerrainState?.amplitude ?? persistedState.controls?.amplitude ?? 24,
          min: 1,
          max: 80,
          step: 1,
        },
        frequency: {
          value: urlTerrainState?.frequency ?? persistedState.controls?.frequency ?? 0.012,
          min: 0.002,
          max: 0.08,
          step: 0.001,
        },
        octaves: { value: urlTerrainState?.octaves ?? persistedState.controls?.octaves ?? 5, min: 1, max: 8, step: 1 },
        persistence: {
          value: urlTerrainState?.persistence ?? persistedState.controls?.persistence ?? 0.5,
          min: 0.2,
          max: 0.8,
          step: 0.01,
        },
        lacunarity: {
          value: urlTerrainState?.lacunarity ?? persistedState.controls?.lacunarity ?? 2,
          min: 1.2,
          max: 3,
          step: 0.1,
        },
      },
      { collapsed: false },
    ),
    Streaming: folder(
      {
        chunkSize: {
          value: urlTerrainState?.chunkSize ?? persistedState.controls?.chunkSize ?? 140,
          min: 64,
          max: 280,
          step: 1,
        },
        chunkSegments: {
          value: urlTerrainState?.chunkSegments ?? persistedState.controls?.chunkSegments ?? 96,
          min: 16,
          max: 192,
          step: 1,
        },
        viewRadius: {
          value: urlTerrainState?.viewRadius ?? persistedState.controls?.viewRadius ?? 2,
          min: 1,
          max: 4,
          step: 1,
        },
        cacheSize: {
          value: urlTerrainState?.cacheSize ?? persistedState.controls?.cacheSize ?? 96,
          min: 16,
          max: 192,
          step: 1,
        },
        maxInFlight: {
          value: urlTerrainState?.maxInFlight ?? persistedState.controls?.maxInFlight ?? 8,
          min: 1,
          max: 24,
          step: 1,
        },
      },
      { collapsed: false },
    ),
    Render: folder(
      {
        wireframe: urlTerrainState?.wireframe ?? persistedState.controls?.wireframe ?? false,
      },
      { collapsed: true },
    ),
  })

  const [isPresetDetached, setIsPresetDetached] = useState(false)
  const previousPresetRef = useRef(presetControls.preset)

  useEffect(() => {
    if (presetControls.preset !== previousPresetRef.current) {
      previousPresetRef.current = presetControls.preset
      setIsPresetDetached(false)
    }
  }, [presetControls.preset])

  const previousControlsRef = useRef<GeneratorControlValues | null>(null)
  useEffect(() => {
    const currentControls = controls as GeneratorControlValues
    if (previousControlsRef.current === null) {
      previousControlsRef.current = currentControls
      return
    }

    if (
      presetControls.preset !== 'Custom' &&
      hasTerrainControlChanged(previousControlsRef.current, currentControls)
    ) {
      setIsPresetDetached(true)
    }

    previousControlsRef.current = currentControls
  }, [controls, presetControls.preset])

  const effectivePreset: TerrainPresetName =
    isPresetDetached && presetControls.preset !== 'Custom' ? 'Custom' : presetControls.preset

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const currentUrlState = parseSceneUrlState(window.location.search)
    const stateToPersist: PersistedTerrainState = {
      preset: effectivePreset,
      controls: controls as GeneratorControlValues,
    }

    window.localStorage.setItem(TERRAIN_STORAGE_KEY, JSON.stringify(stateToPersist))
    const nextUrl = serializeSceneUrlState({
      ...currentUrlState,
      terrain: stateToPersist,
    })
    window.history.replaceState(null, '', `${window.location.pathname}${nextUrl}${window.location.hash}`)
  }, [controls, effectivePreset])

  const activeControls = useMemo(() => {
    if (effectivePreset === 'Custom') {
      return controls as GeneratorControlValues
    }

    return {
      ...(controls as GeneratorControlValues),
      ...TERRAIN_PRESETS[effectivePreset],
    } as GeneratorControlValues
  }, [controls, effectivePreset])

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
