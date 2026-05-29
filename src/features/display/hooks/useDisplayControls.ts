import { folder, useControls } from 'leva'
import { useEffect, useMemo } from 'react'
import { DISPLAY_STORAGE_KEY } from '../../shared/persistenceKeys'
import { parseSceneUrlState, serializeSceneUrlState } from '../../shared/sceneUrlState'
import { DEFAULT_DISPLAY_STATE, type DisplayControlsState } from '../types'

export type { DisplayControlsState } from '../types'

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
  const urlState = useMemo(() => {
    if (typeof window === 'undefined') {
      return {}
    }

    return parseSceneUrlState(window.location.search)
  }, [])
  const urlDisplayState = urlState.display

  const controls = useControls('Display', {
    Overlays: folder(
      {
        showPerfDebug: {
          value: urlDisplayState?.showPerfDebug ?? persistedState.showPerfDebug,
          label: 'Perf debug',
        },
        showHeightmap: {
          value: urlDisplayState?.showHeightmap ?? persistedState.showHeightmap,
          label: 'Heightmap preview',
        },
      },
      { collapsed: false },
    ),
    Water: folder(
      {
        showWater: {
          value: urlDisplayState?.showWater ?? persistedState.showWater,
          label: 'Enable water',
        },
        waterOpacity: {
          value: urlDisplayState?.waterOpacity ?? persistedState.waterOpacity,
          min: 0.05,
          max: 0.8,
          step: 0.01,
        },
        waterDepthOpacityBoost: {
          value: urlDisplayState?.waterDepthOpacityBoost ?? persistedState.waterDepthOpacityBoost,
          min: 0,
          max: 1.2,
          step: 0.01,
        },
        waterReflection: {
          value: urlDisplayState?.waterReflection ?? persistedState.waterReflection,
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

    const currentUrlState = parseSceneUrlState(window.location.search)
    window.localStorage.setItem(DISPLAY_STORAGE_KEY, JSON.stringify(controls))
    const nextUrl = serializeSceneUrlState({
      ...currentUrlState,
      display: controls as DisplayControlsState,
    })
    window.history.replaceState(null, '', `${window.location.pathname}${nextUrl}${window.location.hash}`)
  }, [controls])

  return controls
}
