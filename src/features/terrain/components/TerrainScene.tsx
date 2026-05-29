import { useMemo } from 'react'
import { InfiniteTerrain } from './InfiniteTerrain'
import { useTerrainControls } from '../hooks'
import type { TerrainSceneProps } from '../types'

export function TerrainScene({
  onPerfUpdate,
  onHeightmapUpdate,
  showWater,
  waterOpacity,
  waterDepthOpacityBoost,
  waterReflection,
  waterWaveSpeed,
  waterWaveAmplitude,
  waterWaveFrequency,
}: TerrainSceneProps) {
  const { settings, terrainKey } = useTerrainControls()

  const sceneProps = useMemo(
    () => ({
      settings,
      onPerfUpdate,
      onHeightmapUpdate,
      textureMode: settings.texture,
      showWater,
      waterOpacity,
      waterDepthOpacityBoost,
      waterReflection,
      waterWaveSpeed,
      waterWaveAmplitude,
      waterWaveFrequency,
    }),
    [
      settings,
      onPerfUpdate,
      onHeightmapUpdate,
      showWater,
      waterOpacity,
      waterDepthOpacityBoost,
      waterReflection,
      waterWaveSpeed,
      waterWaveAmplitude,
      waterWaveFrequency,
    ],
  )

  return (
    <group>
      <InfiniteTerrain key={terrainKey} {...sceneProps} />
    </group>
  )
}
