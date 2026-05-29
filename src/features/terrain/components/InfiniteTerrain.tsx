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
  water,
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
      {water.showWater
        ? chunks.map((chunk) => (
            <WaterChunk
              key={`water-${chunk.id}`}
              chunkX={chunk.x}
              chunkZ={chunk.z}
              heights={chunkHeights[chunk.id]}
              settings={settings}
              baseOpacity={water.opacity}
              depthOpacityBoost={water.depthOpacityBoost}
              reflectionStrength={water.reflection}
              waveSpeed={water.waveSpeed}
              waveAmplitude={water.waveAmplitude}
              waveFrequency={water.waveFrequency}
              lodStep={Math.min(8, chunk.lodStep * 2)}
            />
          ))
        : null}
    </group>
  )
}
