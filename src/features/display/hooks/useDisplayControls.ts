import { folder, useControls } from 'leva'
import { useEffect, useMemo } from 'react'
import { DISPLAY_STORAGE_KEY } from '../../shared/persistenceKeys'

type DisplayControlsState = {
  showPerfDebug: boolean
  showHeightmap: boolean
  showWater: boolean
  waterOpacity: number
  waterDepthOpacityBoost: number
  waterReflection: number
}

const DEFAULT_DISPLAY_STATE: DisplayControlsState = {
  showPerfDebug: true,
  showHeightmap: true,
  showWater: true,
  waterOpacity: 0.26,
  waterDepthOpacityBoost: 0.56,
  waterReflection: 0.26,
}

const loadPersistedDisplayState = (): DisplayControlsState => {
  if (typeof window === 'undefined') {
    return DEFAULT_DISPLAY_STATE
  }

  const raw = window.localStorage.getItem(DISPLAY_STORAGE_KEY)
  if (raw === null) {
    return DEFAULT_DISPLAY_STATE
  }

  try {
    const parsed = JSON.parse(raw) as Partial<DisplayControlsState>
    return {
      ...DEFAULT_DISPLAY_STATE,
      ...parsed,
    }
  } catch {
    return DEFAULT_DISPLAY_STATE
  }
}

export const useDisplayControls = () => {
  const persistedState = useMemo(() => loadPersistedDisplayState(), [])

  const controls = useControls('Display', {
    Overlays: folder(
      {
        showPerfDebug: { value: persistedState.showPerfDebug, label: 'Perf debug' },
        showHeightmap: { value: persistedState.showHeightmap, label: 'Heightmap preview' },
      },
      { collapsed: false },
    ),
    Water: folder(
      {
        showWater: { value: persistedState.showWater, label: 'Enable water' },
        waterOpacity: { value: persistedState.waterOpacity, min: 0.05, max: 0.8, step: 0.01 },
        waterDepthOpacityBoost: {
          value: persistedState.waterDepthOpacityBoost,
          min: 0,
          max: 1.2,
          step: 0.01,
        },
        waterReflection: {
          value: persistedState.waterReflection,
          min: 0,
          max: 1.1,
          step: 0.01,
        },
      },
      { collapsed: false },
    ),
  })

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(DISPLAY_STORAGE_KEY, JSON.stringify(controls))
  }, [controls])

  return controls
}
