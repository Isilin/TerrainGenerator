import { useMemo } from 'react'
import type { TerrainColorMode } from '../../../lib/terrain'
import { createChunkGeometryFromHeights } from '../../../lib/terrain'
import type { TerrainChunkProps } from '../types'

export function TerrainChunk({
  chunkX,
  chunkZ,
  heights,
  settings,
  textureMode,
  lodStep = 1,
}: TerrainChunkProps) {
  const geometry = useMemo(() => {
    if (heights === undefined) {
      return null
    }
    const colorMode: TerrainColorMode =
      textureMode === 'Grayscale' ? 'grayscale' : 'altitude'
    return createChunkGeometryFromHeights(settings, heights, colorMode, lodStep)
  }, [heights, lodStep, settings, textureMode])

  if (geometry === null) {
    return null
  }

  return (
    <mesh
      geometry={geometry}
      position={[chunkX * settings.chunkSize, 0, chunkZ * settings.chunkSize]}
      receiveShadow
      castShadow
    >
      <meshStandardMaterial
        color="#ffffff"
        vertexColors
        roughness={textureMode === 'Grayscale' ? 0.98 : 0.92}
        metalness={0.05}
        wireframe={settings.wireframe}
      />
    </mesh>
  )
}
