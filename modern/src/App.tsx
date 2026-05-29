import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Leva, useControls } from 'leva'
import { useEffect, useMemo, useRef, useState } from 'react'
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

function InfiniteTerrain({ settings }: { settings: TerrainChunkSettings }) {
  const [centerChunk, setCenterChunk] = useState({ x: 0, z: 0 })
  const [chunkHeights, setChunkHeights] = useState<Record<string, Float32Array>>({})
  const workerRef = useRef<Worker | null>(null)
  const activeRequestsRef = useRef<Set<string>>(new Set())
  const cacheRef = useRef<LruCache<string, Float32Array>>(
    new LruCache<string, Float32Array>(settings.cacheSize),
  )

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

  useFrame(({ camera }) => {
    const x = Math.round(camera.position.x / settings.chunkSize)
    const z = Math.round(camera.position.z / settings.chunkSize)
    if (x !== centerChunk.x || z !== centerChunk.z) {
      setCenterChunk({ x, z })
    }
  })

  const chunks = useMemo(() => {
    return buildVisibleChunks(centerChunk, settings.viewRadius, createChunkId)
  }, [centerChunk, settings.viewRadius])

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

function TerrainScene() {
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
    cacheSize: { value: 96, min: 16, max: 192, step: 1 },
    maxInFlight: { value: 8, min: 1, max: 24, step: 1 },
    wireframe: false,
  })

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
      cacheSize: controls.cacheSize,
      maxInFlight: controls.maxInFlight,
      wireframe: controls.wireframe,
    }),
    [controls],
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
        cacheSize: settings.cacheSize,
        maxInFlight: settings.maxInFlight,
      }),
    [settings],
  )

  return (
    <group>
      <InfiniteTerrain key={terrainKey} settings={settings} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.25, 0]} receiveShadow>
        <planeGeometry args={[2800, 2800, 1, 1]} />
        <meshStandardMaterial color="#718355" roughness={1} metalness={0} />
      </mesh>
    </group>
  )
}

function App() {
  return (
    <main className="app-shell">
      <header className="hud">
        <h1>Terrain Generator v2</h1>
        <p>Refonte en cours: rendu moderne avec seed reproducible et controles live.</p>
      </header>
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
        <TerrainScene />
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
