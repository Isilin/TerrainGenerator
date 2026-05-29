import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { ShaderMaterial } from 'three'
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
  waveSpeed,
  waveAmplitude,
  waveFrequency,
  lodStep = 1,
}: WaterChunkProps) {
  const materialRef = useRef<ShaderMaterial | null>(null)

  const geometry = useMemo(() => {
    if (heights === undefined) {
      return null
    }
    return createWaterGeometryFromHeights(settings, heights, { lodStep })
  }, [heights, lodStep, settings])

  const uniforms = useMemo(
    () => ({
      waterColor: { value: [0.29, 0.62, 0.86] },
      baseOpacity: { value: baseOpacity },
      depthOpacityBoost: { value: depthOpacityBoost },
      reflectionStrength: { value: reflectionStrength },
      time: { value: 0 },
      waveSpeed: { value: waveSpeed },
      waveAmplitude: { value: waveAmplitude },
      waveFrequency: { value: waveFrequency },
      lightDirection: { value: [0.52, 0.8, 0.32] },
    }),
    [baseOpacity, depthOpacityBoost, reflectionStrength, waveAmplitude, waveFrequency, waveSpeed],
  )

  useFrame(({ clock }) => {
    if (materialRef.current !== null) {
      materialRef.current.uniforms.time.value = clock.getElapsedTime()
    }
  })

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
        ref={materialRef}
        vertexShader={WATER_VERTEX_SHADER}
        fragmentShader={WATER_FRAGMENT_SHADER}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  )
}
