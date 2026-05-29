import { useMemo } from 'react'
import { InfiniteTerrain } from './InfiniteTerrain'
import { useTerrainControls } from '../hooks'
import type { TerrainSceneProps } from '../types'

export function TerrainScene({
  onPerfUpdate,
  onHeightmapUpdate,
  water,
}: TerrainSceneProps) {
  const { settings, terrainKey } = useTerrainControls()

  const sceneProps = useMemo(
    () => ({
      settings,
      onPerfUpdate,
      onHeightmapUpdate,
      textureMode: settings.texture,
      water,
    }),
    [
      settings,
      onPerfUpdate,
      onHeightmapUpdate,
      water,
    ],
  )

  return (
    <group>
      <InfiniteTerrain key={terrainKey} {...sceneProps} />
    </group>
  )
}
