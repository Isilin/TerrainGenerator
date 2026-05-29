import { useMemo } from 'react'
import { createWaterGeometryFromHeights } from '../../../lib/terrain'
import { WATER_FRAGMENT_SHADER, WATER_VERTEX_SHADER } from '../config'
import type { WaterChunkProps } from '../types'

export function WaterChunk({
  chunkX,
  chunkZ,
  heights,
  settings,
  baseOpacity,
  depthOpacityBoost,
  reflectionStrength,
}: WaterChunkProps) {
  const geometry = useMemo(() => {
    if (heights === undefined) {
      return null
    }
    return createWaterGeometryFromHeights(settings, heights)
  }, [heights, settings])

  const uniforms = useMemo(
    () => ({
      waterColor: { value: [0.29, 0.62, 0.86] },
      baseOpacity: { value: baseOpacity },
      depthOpacityBoost: { value: depthOpacityBoost },
      reflectionStrength: { value: reflectionStrength },
      lightDirection: { value: [0.52, 0.8, 0.32] },
    }),
    [baseOpacity, depthOpacityBoost, reflectionStrength],
  )

  if (geometry === null) {
    return null
  }

  return (
    <mesh
      geometry={geometry}
      position={[chunkX * settings.chunkSize, 0, chunkZ * settings.chunkSize]}
      renderOrder={2}
    >
      <shaderMaterial
        vertexShader={WATER_VERTEX_SHADER}
        fragmentShader={WATER_FRAGMENT_SHADER}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  )
}
