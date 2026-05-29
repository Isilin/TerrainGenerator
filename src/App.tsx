import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Leva, useControls } from 'leva'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { PostProcessSettings } from './lib/filters'
import { buildVisibleChunks } from './lib/chunks'
import { LruCache } from './lib/lru'
import {
  createChunkGeometryFromHeights,
  createChunkId,
  type TerrainChunkSettings,
  type TerrainGenerationSettings,
} from './lib/terrain'
import './App.css'

type TerrainChunkResponse = {
  chunkId: string
  chunkX: number
  chunkZ: number
  heights: Float32Array
}

type PerfStats = {
  fps: number
  centerChunkX: number
  centerChunkZ: number
  visibleChunks: number
  loadedChunks: number
  inFlightRequests: number
  cacheSize: number
}

const initialPerfStats: PerfStats = {
  fps: 0,
  centerChunkX: 0,
  centerChunkZ: 0,
  visibleChunks: 0,
  loadedChunks: 0,
  inFlightRequests: 0,
  cacheSize: 0,
}

function TerrainChunk({
  chunkX,
  chunkZ,
  heights,
  settings,
}: {
  chunkX: number
  chunkZ: number
  heights: Float32Array | undefined
  settings: TerrainChunkSettings
}) {
  const geometry = useMemo(() => {
    if (heights === undefined) {
      return null
    }
    return createChunkGeometryFromHeights(settings, heights)
  }, [heights, settings])

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
        color="#97a97c"
        roughness={0.92}
        metalness={0.05}
        wireframe={settings.wireframe}
      />
    </mesh>
  )
}

function InfiniteTerrain({
  settings,
  onPerfUpdate,
}: {
  settings: TerrainChunkSettings
  onPerfUpdate: (stats: PerfStats) => void
}) {
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
    const worker = new Worker(new URL('./workers/terrainWorker.ts', import.meta.url), {
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

  return (
    <group>
      {chunks.map((chunk) => (
        <TerrainChunk
          key={chunk.id}
          chunkX={chunk.x}
          chunkZ={chunk.z}
          heights={chunkHeights[chunk.id]}
          settings={settings}
        />
      ))}
    </group>
  )
}

function TerrainScene({ onPerfUpdate }: { onPerfUpdate: (stats: PerfStats) => void }) {
  const controls = useControls('Generator', {
    seed: 'terrain-v2',
    chunkSize: { value: 140, min: 64, max: 280, step: 1 },
    chunkSegments: { value: 96, min: 16, max: 192, step: 1 },
    viewRadius: { value: 2, min: 1, max: 4, step: 1 },
    amplitude: { value: 24, min: 1, max: 80, step: 1 },
    frequency: { value: 0.012, min: 0.002, max: 0.08, step: 0.001 },
    octaves: { value: 5, min: 1, max: 8, step: 1 },
    persistence: { value: 0.5, min: 0.2, max: 0.8, step: 0.01 },
    lacunarity: { value: 2, min: 1.2, max: 3, step: 0.1 },
    postProcess: {
      options: ['none', 'mean', 'median', 'conservative'],
      value: 'none',
    },
    meanWeight: { value: 0, min: 0, max: 8, step: 0.5 },
    conservativeMultiplier: { value: 1, min: 0.25, max: 12, step: 0.25 },
    cacheSize: { value: 96, min: 16, max: 192, step: 1 },
    maxInFlight: { value: 8, min: 1, max: 24, step: 1 },
    wireframe: false,
  })

  const postProcess = useMemo<PostProcessSettings>(() => {
    if (controls.postProcess === 'mean') {
      return { mode: 'mean', weight: controls.meanWeight }
    }
    if (controls.postProcess === 'median') {
      return { mode: 'median' }
    }
    if (controls.postProcess === 'conservative') {
      return {
        mode: 'conservative',
        multiplier: controls.conservativeMultiplier,
      }
    }
    return { mode: 'none' }
  }, [controls.postProcess, controls.meanWeight, controls.conservativeMultiplier])

  const settings = useMemo(
    () => ({
      seed: controls.seed,
      chunkSize: controls.chunkSize,
      chunkSegments: controls.chunkSegments,
      viewRadius: controls.viewRadius,
      amplitude: controls.amplitude,
      frequency: controls.frequency,
      octaves: controls.octaves,
      persistence: controls.persistence,
      lacunarity: controls.lacunarity,
      postProcess,
      cacheSize: controls.cacheSize,
      maxInFlight: controls.maxInFlight,
      wireframe: controls.wireframe,
    }),
    [controls, postProcess],
  )

  const terrainKey = useMemo(
    () =>
      JSON.stringify({
        seed: settings.seed,
        chunkSize: settings.chunkSize,
        chunkSegments: settings.chunkSegments,
        amplitude: settings.amplitude,
        frequency: settings.frequency,
        octaves: settings.octaves,
        persistence: settings.persistence,
        lacunarity: settings.lacunarity,
        postProcess: settings.postProcess,
        cacheSize: settings.cacheSize,
        maxInFlight: settings.maxInFlight,
      }),
    [settings],
  )

  return (
    <group>
      <InfiniteTerrain key={terrainKey} settings={settings} onPerfUpdate={onPerfUpdate} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.25, 0]} receiveShadow>
        <planeGeometry args={[2800, 2800, 1, 1]} />
        <meshStandardMaterial color="#718355" roughness={1} metalness={0} />
      </mesh>
    </group>
  )
}

function PerformanceOverlay({ stats }: { stats: PerfStats }) {
  return (
    <aside className="perf-overlay" aria-live="polite">
      <h2>Perf Debug</h2>
      <dl>
        <div>
          <dt>FPS</dt>
          <dd>{stats.fps.toFixed(1)}</dd>
        </div>
        <div>
          <dt>Chunk center</dt>
          <dd>
            {stats.centerChunkX}, {stats.centerChunkZ}
          </dd>
        </div>
        <div>
          <dt>Chunks visibles</dt>
          <dd>{stats.visibleChunks}</dd>
        </div>
        <div>
          <dt>Chunks charges</dt>
          <dd>{stats.loadedChunks}</dd>
        </div>
        <div>
          <dt>Req. en vol</dt>
          <dd>{stats.inFlightRequests}</dd>
        </div>
        <div>
          <dt>Cache LRU</dt>
          <dd>{stats.cacheSize}</dd>
        </div>
      </dl>
    </aside>
  )
}

function App() {
  const [perfStats, setPerfStats] = useState<PerfStats>(initialPerfStats)

  const handlePerfUpdate = useCallback((stats: PerfStats) => {
    setPerfStats(stats)
  }, [])

  return (
    <main className="app-shell">
      <header className="hud">
        <h1>Terrain Generator v2</h1>
        <p>Refonte en cours: rendu moderne avec seed reproducible et controles live.</p>
      </header>
      <PerformanceOverlay stats={perfStats} />
      <Canvas
        className="viewport"
        shadows
        camera={{ position: [0, 85, 140], fov: 48, near: 0.1, far: 2000 }}
      >
        <color attach="background" args={["#d8e2dc"]} />
        <fog attach="fog" args={["#d8e2dc", 180, 480]} />
        <ambientLight intensity={0.45} />
        <directionalLight
          castShadow
          intensity={1.25}
          position={[120, 180, 90]}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <TerrainScene onPerfUpdate={handlePerfUpdate} />
        <OrbitControls
          enablePan
          minDistance={45}
          maxDistance={520}
          maxPolarAngle={Math.PI * 0.49}
        />
      </Canvas>
      <Leva collapsed={false} titleBar={{ title: 'Control Panel' }} />
    </main>
  )
}

export default App
