import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import { buildVisibleChunks } from '../../../lib/chunks'
import { LruCache } from '../../../lib/lru'
import {
  createChunkId,
  type TerrainChunkSettings,
  type TerrainGenerationSettings,
} from '../../../lib/terrain'
import type { TerrainChunkRequest, TerrainChunkResponse } from '../contracts/terrainWorker.contract'
import type { HeightmapPreviewData, PerfStats } from '../types'

export type TerrainStreamState = {
  chunks: Array<{ id: string; x: number; z: number; lodStep: number }>
  chunkHeights: Record<string, Float32Array>
}

const getLodStepForDistance = (distance: number) => {
  if (distance <= 1) {
    return 1
  }
  if (distance <= 2) {
    return 2
  }
  return 4
}

export const useTerrainStream = (
  settings: TerrainChunkSettings,
  centerChunk: { x: number; z: number },
  onPerfUpdate: (stats: PerfStats) => void,
  onHeightmapUpdate: (preview: HeightmapPreviewData | null) => void,
) => {
  type RequestMeta = {
    requestId: string
    streamRevision: number
    startedAtMs: number
  }

  const [chunkHeights, setChunkHeights] = useState<Record<string, Float32Array>>({})
  const workerRef = useRef<Worker | null>(null)
  const activeRequestsRef = useRef<Set<string>>(new Set())
  const requestMetaRef = useRef<Map<string, RequestMeta>>(new Map())
  const streamRevisionRef = useRef(0)
  const visibleChunkIdsRef = useRef<Set<string>>(new Set())
  const perfMetricsRef = useRef({
    lastChunkLatencyMs: 0,
    totalLatencyMs: 0,
    completedRequests: 0,
    staleResponsesDiscarded: 0,
  })
  const cacheRef = useRef<LruCache<string, Float32Array>>(
    new LruCache<string, Float32Array>(settings.cacheSize),
  )
  const fpsAccumulator = useRef({ elapsed: 0, frames: 0 })
  const cacheSizeRef = useRef(settings.cacheSize)

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
    const activeRequests = activeRequestsRef.current
    const requestMeta = requestMetaRef.current

    const worker = new Worker(new URL('../../../workers/terrainWorker.ts', import.meta.url), {
      type: 'module',
    })

    worker.onmessage = (event: MessageEvent<TerrainChunkResponse>) => {
      const { requestId, streamRevision, chunkId, heights } = event.data
      const metrics = perfMetricsRef.current
      const requestMeta = requestMetaRef.current.get(chunkId)

      if (requestMeta === undefined) {
        metrics.staleResponsesDiscarded += 1
        return
      }

      activeRequestsRef.current.delete(chunkId)
      requestMetaRef.current.delete(chunkId)

      if (
        requestMeta.requestId !== requestId ||
        requestMeta.streamRevision !== streamRevision ||
        !visibleChunkIdsRef.current.has(chunkId)
      ) {
        metrics.staleResponsesDiscarded += 1
        cacheRef.current.set(chunkId, heights)
        return
      }

      const latencyMs = Math.max(0, performance.now() - requestMeta.startedAtMs)
      metrics.lastChunkLatencyMs = latencyMs
      metrics.totalLatencyMs += latencyMs
      metrics.completedRequests += 1

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
      activeRequests.clear()
      requestMeta.clear()
    }
  }, [])

  useEffect(() => {
    if (cacheSizeRef.current === settings.cacheSize) {
      return
    }

    cacheSizeRef.current = settings.cacheSize
    cacheRef.current = new LruCache<string, Float32Array>(settings.cacheSize)
  }, [settings.cacheSize])

  const chunks = useMemo(
    () =>
      buildVisibleChunks(centerChunk, settings.viewRadius, createChunkId).map((chunk) => {
        const distance = Math.max(
          Math.abs(chunk.x - centerChunk.x),
          Math.abs(chunk.z - centerChunk.z),
        )

        return {
          ...chunk,
          lodStep: getLodStepForDistance(distance),
          distance,
        }
      }),
    [centerChunk, settings.viewRadius],
  )

  const prioritizedChunks = useMemo(
    () => [...chunks].sort((a, b) => a.distance - b.distance),
    [chunks],
  )

  useEffect(() => {
    streamRevisionRef.current += 1
    const visibleIds = new Set<string>(chunks.map((chunk) => chunk.id))
    visibleChunkIdsRef.current = visibleIds

    for (const [chunkId, requestMeta] of requestMetaRef.current.entries()) {
      if (!visibleIds.has(chunkId)) {
        requestMetaRef.current.set(chunkId, {
          ...requestMeta,
          streamRevision: streamRevisionRef.current,
        })
      }
    }
  }, [chunks, generationSettings])

  useFrame((_, delta) => {
    const accumulator = fpsAccumulator.current
    accumulator.elapsed += delta
    accumulator.frames += 1

    if (accumulator.elapsed < 0.35) {
      return
    }

    const loadedChunks = chunks.reduce(
      (count, chunk) => count + (chunkHeights[chunk.id] !== undefined ? 1 : 0),
      0,
    )

    onPerfUpdate({
      fps: accumulator.frames / accumulator.elapsed,
      centerChunkX: centerChunk.x,
      centerChunkZ: centerChunk.z,
      visibleChunks: chunks.length,
      loadedChunks,
      inFlightRequests: activeRequestsRef.current.size,
      cacheSize: cacheRef.current.size,
      lastChunkLatencyMs: perfMetricsRef.current.lastChunkLatencyMs,
      avgChunkLatencyMs:
        perfMetricsRef.current.completedRequests > 0
          ? perfMetricsRef.current.totalLatencyMs / perfMetricsRef.current.completedRequests
          : 0,
      staleResponsesDiscarded: perfMetricsRef.current.staleResponsesDiscarded,
    })

    accumulator.elapsed = 0
    accumulator.frames = 0
  })

  useEffect(() => {
    let availableSlots = Math.max(1, settings.maxInFlight - activeRequestsRef.current.size)
    const hydrateFromCache: Array<{ id: string; heights: Float32Array }> = []

    for (const chunk of prioritizedChunks) {
      if (chunkHeights[chunk.id] !== undefined) {
        continue
      }

      const fromCache = cacheRef.current.get(chunk.id)
      if (fromCache !== undefined) {
        hydrateFromCache.push({ id: chunk.id, heights: fromCache })
        continue
      }

      if (activeRequestsRef.current.has(chunk.id) || availableSlots <= 0) {
        continue
      }

      const worker = workerRef.current
      if (worker === null) {
        continue
      }

      activeRequestsRef.current.add(chunk.id)
      const requestId = `${chunk.id}:${streamRevisionRef.current}:${performance.now().toFixed(3)}`
      const request: TerrainChunkRequest = {
        requestId,
        streamRevision: streamRevisionRef.current,
        chunkX: chunk.x,
        chunkZ: chunk.z,
        settings: generationSettings,
      }

      requestMetaRef.current.set(chunk.id, {
        requestId,
        streamRevision: streamRevisionRef.current,
        startedAtMs: performance.now(),
      })

      worker.postMessage(request)
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
  }, [chunkHeights, generationSettings, prioritizedChunks, settings.maxInFlight])

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

  return {
    chunks: chunks.map((chunk) => ({
      id: chunk.id,
      x: chunk.x,
      z: chunk.z,
      lodStep: chunk.lodStep,
    })),
    chunkHeights,
  }
}
