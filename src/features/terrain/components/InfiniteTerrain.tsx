import { useFrame } from '@react-three/fiber'
import { useState } from 'react'
import { TerrainChunk } from './TerrainChunk'
import { WaterChunk } from './WaterChunk'
import type { InfiniteTerrainProps } from '../types'
import { useTerrainStream } from '../hooks/useTerrainStream'

export function InfiniteTerrain({
  settings,
  onPerfUpdate,
  onHeightmapUpdate,
  textureMode,
  showWater,
  waterOpacity,
  waterDepthOpacityBoost,
  waterReflection,
  waterWaveSpeed,
  waterWaveAmplitude,
  waterWaveFrequency,
}: InfiniteTerrainProps) {
  const [centerChunk, setCenterChunk] = useState({ x: 0, z: 0 })

  useFrame(({ camera }) => {
    const x = Math.round(camera.position.x / settings.chunkSize)
    const z = Math.round(camera.position.z / settings.chunkSize)
    if (x !== centerChunk.x || z !== centerChunk.z) {
      setCenterChunk({ x, z })
    }
  })

  const { chunks, chunkHeights } = useTerrainStream(settings, centerChunk, onPerfUpdate, onHeightmapUpdate)

  return (
    <group>
      {chunks.map((chunk) => (
        <TerrainChunk
          key={chunk.id}
          chunkX={chunk.x}
          chunkZ={chunk.z}
          heights={chunkHeights[chunk.id]}
          settings={settings}
          textureMode={textureMode}
          lodStep={chunk.lodStep}
        />
      ))}
      {showWater
        ? chunks.map((chunk) => (
            <WaterChunk
              key={`water-${chunk.id}`}
              chunkX={chunk.x}
              chunkZ={chunk.z}
              heights={chunkHeights[chunk.id]}
              settings={settings}
              baseOpacity={waterOpacity}
              depthOpacityBoost={waterDepthOpacityBoost}
              reflectionStrength={waterReflection}
              waveSpeed={waterWaveSpeed}
              waveAmplitude={waterWaveAmplitude}
              waveFrequency={waterWaveFrequency}
              lodStep={Math.min(8, chunk.lodStep * 2)}
            />
          ))
        : null}
    </group>
  )
}
