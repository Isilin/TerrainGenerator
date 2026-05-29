import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import { buildVisibleChunks } from '../../../lib/chunks'
import { LruCache } from '../../../lib/lru'
import {
  createChunkId,
  type TerrainGenerationSettings,
} from '../../../lib/terrain'
import { TerrainChunk } from './TerrainChunk'
import { WaterChunk } from './WaterChunk'
import type { InfiniteTerrainProps, TerrainChunkResponse } from '../types'

export function InfiniteTerrain({
  settings,
  onPerfUpdate,
  onHeightmapUpdate,
  textureMode,
  showWater,
  waterOpacity,
  waterDepthOpacityBoost,
  waterReflection,
}: InfiniteTerrainProps) {
  const [centerChunk, setCenterChunk] = useState({ x: 0, z: 0 })
  const [chunkHeights, setChunkHeights] = useState<Record<string, Float32Array>>({})
  const workerRef = useRef<Worker | null>(null)
  const activeRequestsRef = useRef<Set<string>>(new Set())
  const cacheRef = useRef<LruCache<string, Float32Array>>(
    new LruCache<string, Float32Array>(settings.cacheSize),
  )
  const fpsAccumulator = useRef({ elapsed: 0, frames: 0 })

  const generationSettings: TerrainGenerationSettings = useMemo(
    () => ({
      seed: settings.seed,
      noiseAlgorithm: settings.noiseAlgorithm,
      easing: settings.easing,
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
    }),
    [
      settings.seed,
      settings.noiseAlgorithm,
      settings.easing,
      settings.scattering,
      settings.curve,
      settings.chunkSize,
      settings.chunkSegments,
      settings.amplitude,
      settings.frequency,
      settings.octaves,
      settings.persistence,
      settings.lacunarity,
      settings.postProcess,
    ],
  )

  useEffect(() => {
    const worker = new Worker(new URL('../../../workers/terrainWorker.ts', import.meta.url), {
      type: 'module',
    })

    worker.onmessage = (event: MessageEvent<TerrainChunkResponse>) => {
      const { chunkId, heights } = event.data

      activeRequestsRef.current.delete(chunkId)
      cacheRef.current.set(chunkId, heights)
      setChunkHeights((previous) => {
        if (previous[chunkId] === heights) {
          return previous
        }
        return { ...previous, [chunkId]: heights }
      })
    }

    workerRef.current = worker
    return () => {
      worker.terminate()
      workerRef.current = null
    }
  }, [])

  const chunks = buildVisibleChunks(centerChunk, settings.viewRadius, createChunkId)

  useFrame(({ camera }) => {
    const x = Math.round(camera.position.x / settings.chunkSize)
    const z = Math.round(camera.position.z / settings.chunkSize)
    if (x !== centerChunk.x || z !== centerChunk.z) {
      setCenterChunk({ x, z })
    }
  })

  useFrame((_, delta) => {
    const accumulator = fpsAccumulator.current
    accumulator.elapsed += delta
    accumulator.frames += 1

    if (accumulator.elapsed < 0.35) {
      return
    }

    let loadedChunks = 0
    for (const chunk of chunks) {
      if (chunkHeights[chunk.id] !== undefined) {
        loadedChunks += 1
      }
    }

    onPerfUpdate({
      fps: accumulator.frames / accumulator.elapsed,
      centerChunkX: centerChunk.x,
      centerChunkZ: centerChunk.z,
      visibleChunks: chunks.length,
      loadedChunks,
      inFlightRequests: activeRequestsRef.current.size,
      cacheSize: cacheRef.current.size,
    })

    accumulator.elapsed = 0
    accumulator.frames = 0
  })

  useEffect(() => {
    const hydrateFromCache: Array<{ id: string; heights: Float32Array }> = []
    let availableSlots = Math.max(1, settings.maxInFlight - activeRequestsRef.current.size)

    for (const chunk of chunks) {
      if (chunkHeights[chunk.id] !== undefined) {
        continue
      }

      const fromCache = cacheRef.current.get(chunk.id)
      if (fromCache !== undefined) {
        hydrateFromCache.push({ id: chunk.id, heights: fromCache })
        continue
      }

      if (activeRequestsRef.current.has(chunk.id)) {
        continue
      }

      if (availableSlots <= 0) {
        continue
      }

      const worker = workerRef.current
      if (worker === null) {
        continue
      }

      activeRequestsRef.current.add(chunk.id)
      worker.postMessage({
        chunkX: chunk.x,
        chunkZ: chunk.z,
        settings: generationSettings,
      })
      availableSlots -= 1
    }

    if (hydrateFromCache.length > 0) {
      queueMicrotask(() => {
        setChunkHeights((previous) => {
          let changed = false
          const next = { ...previous }
          for (const item of hydrateFromCache) {
            if (next[item.id] === undefined) {
              next[item.id] = item.heights
              changed = true
            }
          }
          return changed ? next : previous
        })
      })
    }
  }, [chunks, chunkHeights, generationSettings, settings.maxInFlight])

  useEffect(() => {
    const centerId = createChunkId(centerChunk.x, centerChunk.z)
    const centerHeights = chunkHeights[centerId]

    if (centerHeights === undefined) {
      onHeightmapUpdate(null)
      return
    }

    onHeightmapUpdate({
      heights: centerHeights,
      side: settings.chunkSegments + 1,
    })
  }, [centerChunk, chunkHeights, onHeightmapUpdate, settings.chunkSegments])

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
            />
          ))
        : null}
    </group>
  )
}
