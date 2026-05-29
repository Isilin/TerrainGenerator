import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { folder, Leva, useControls } from 'leva'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { PostProcessSettings } from './lib/filters'
import { buildVisibleChunks } from './lib/chunks'
import {
  LEGACY_CURVE_OPTIONS,
  LEGACY_EASING_OPTIONS,
  LEGACY_HEIGHTMAP_OPTIONS,
  LEGACY_SCATTERING_OPTIONS,
  LEGACY_SMOOTHING_OPTIONS,
  LEGACY_TEXTURE_OPTIONS,
  mapHeightmapToNoiseAlgorithm,
  mapSmoothingToPostProcess,
  type LegacyCurveOption,
  type LegacyEasingOption,
  type LegacyHeightmapOption,
  type LegacyScatteringOption,
  type LegacySmoothingOption,
  type LegacyTextureOption,
} from './lib/legacy'
import { LruCache } from './lib/lru'
import {
  createChunkGeometryFromHeights,
  createChunkId,
  createWaterGeometryFromHeights,
  type TerrainColorMode,
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

type HeightmapPreviewData = {
  heights: Float32Array
  side: number
}

type GeneratorControlValues = {
  easing: LegacyEasingOption
  heightmap: LegacyHeightmapOption
  smoothing: LegacySmoothingOption
  texture: LegacyTextureOption
  scattering: LegacyScatteringOption
  curve: LegacyCurveOption
  seed: string
  chunkSize: number
  chunkSegments: number
  viewRadius: number
  amplitude: number
  frequency: number
  octaves: number
  persistence: number
  lacunarity: number
  cacheSize: number
  maxInFlight: number
  wireframe: boolean
}

type TerrainPresetName =
  | 'Custom'
  | 'Archipelago'
  | 'AlpineRidges'
  | 'SoftDunes'
  | 'VolcanicPlateau'

const TERRAIN_PRESET_OPTIONS: TerrainPresetName[] = [
  'Custom',
  'Archipelago',
  'AlpineRidges',
  'SoftDunes',
  'VolcanicPlateau',
]

const TERRAIN_PRESETS: Record<Exclude<TerrainPresetName, 'Custom'>, Partial<GeneratorControlValues>>
  = {
    Archipelago: {
      seed: 'archipelago-v2',
      heightmap: 'PerlinDiamond',
      smoothing: 'Gaussian (1.0, 7)',
      scattering: 'PerlinAltitude',
      curve: 'EaseInOut',
      texture: 'Blended',
      amplitude: 22,
      frequency: 0.016,
      octaves: 5,
      persistence: 0.52,
      lacunarity: 2.1,
      viewRadius: 2,
    },
    AlpineRidges: {
      seed: 'alpine-v2',
      heightmap: 'SimplexLayers',
      smoothing: 'Conservative (1)',
      scattering: 'Worley',
      curve: 'EaseIn',
      texture: 'Blended',
      amplitude: 40,
      frequency: 0.01,
      octaves: 6,
      persistence: 0.46,
      lacunarity: 2.25,
      viewRadius: 2,
    },
    SoftDunes: {
      seed: 'dunes-v2',
      heightmap: 'Value',
      smoothing: 'GaussianBox',
      scattering: 'Linear',
      curve: 'EaseOut',
      texture: 'Grayscale',
      amplitude: 14,
      frequency: 0.02,
      octaves: 4,
      persistence: 0.58,
      lacunarity: 1.8,
      viewRadius: 3,
    },
    VolcanicPlateau: {
      seed: 'volcano-v2',
      heightmap: 'Worley',
      smoothing: 'Median',
      scattering: 'Worley',
      curve: 'EaseOut',
      texture: 'Blended',
      amplitude: 34,
      frequency: 0.013,
      octaves: 5,
      persistence: 0.49,
      lacunarity: 2.35,
      viewRadius: 2,
    },
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

const WATER_VERTEX_SHADER = `
  attribute float depthFactor;
  varying float vDepth;
  varying vec3 vWorldPos;
  varying vec3 vWorldNormal;

  void main() {
    vDepth = depthFactor;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`

const WATER_FRAGMENT_SHADER = `
  uniform vec3 waterColor;
  uniform float baseOpacity;
  uniform float depthOpacityBoost;
  uniform float reflectionStrength;
  uniform vec3 lightDirection;

  varying float vDepth;
  varying vec3 vWorldPos;
  varying vec3 vWorldNormal;

  void main() {
    vec3 normal = normalize(vWorldNormal);
    vec3 viewDir = normalize(cameraPosition - vWorldPos);
    vec3 lightDir = normalize(lightDirection);

    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);
    float specular = pow(max(dot(reflect(-lightDir, normal), viewDir), 0.0), 44.0);
    float alpha = clamp(baseOpacity + vDepth * depthOpacityBoost, 0.03, 0.96);

    vec3 reflectedLight = vec3((fresnel + specular * 0.7) * reflectionStrength);
    vec3 finalColor = waterColor + reflectedLight;

    gl_FragColor = vec4(finalColor, alpha);
  }
`

function TerrainChunk({
  chunkX,
  chunkZ,
  heights,
  settings,
  textureMode,
}: {
  chunkX: number
  chunkZ: number
  heights: Float32Array | undefined
  settings: TerrainChunkSettings
  textureMode: LegacyTextureOption
}) {
  const geometry = useMemo(() => {
    if (heights === undefined) {
      return null
    }
    const colorMode: TerrainColorMode =
      textureMode === 'Grayscale' ? 'grayscale' : 'altitude'
    return createChunkGeometryFromHeights(settings, heights, colorMode)
  }, [heights, settings, textureMode])

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

function WaterChunk({
  chunkX,
  chunkZ,
  heights,
  settings,
  baseOpacity,
  depthOpacityBoost,
  reflectionStrength,
}: {
  chunkX: number
  chunkZ: number
  heights: Float32Array | undefined
  settings: TerrainChunkSettings
  baseOpacity: number
  depthOpacityBoost: number
  reflectionStrength: number
}) {
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

function InfiniteTerrain({
  settings,
  onPerfUpdate,
  onHeightmapUpdate,
  textureMode,
  showWater,
  waterOpacity,
  waterDepthOpacityBoost,
  waterReflection,
}: {
  settings: TerrainChunkSettings
  onPerfUpdate: (stats: PerfStats) => void
  onHeightmapUpdate: (preview: HeightmapPreviewData | null) => void
  textureMode: LegacyTextureOption
  showWater: boolean
  waterOpacity: number
  waterDepthOpacityBoost: number
  waterReflection: number
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

function TerrainScene({
  onPerfUpdate,
  onHeightmapUpdate,
  showWater,
  waterOpacity,
  waterDepthOpacityBoost,
  waterReflection,
}: {
  onPerfUpdate: (stats: PerfStats) => void
  onHeightmapUpdate: (preview: HeightmapPreviewData | null) => void
  showWater: boolean
  waterOpacity: number
  waterDepthOpacityBoost: number
  waterReflection: number
}) {
  const presetControls = useControls('Presets', {
    preset: {
      options: TERRAIN_PRESET_OPTIONS,
      value: 'Custom' as TerrainPresetName,
      label: 'Terrain preset',
    },
  })

  const controls = useControls('Generator', {
    Terrain: folder(
      {
        seed: { value: 'terrain-v2', label: 'Seed' },
        heightmap: {
          options: LEGACY_HEIGHTMAP_OPTIONS as unknown as string[],
          value: 'PerlinDiamond',
        },
        smoothing: {
          options: LEGACY_SMOOTHING_OPTIONS as unknown as string[],
          value: 'None',
        },
        texture: {
          options: LEGACY_TEXTURE_OPTIONS as unknown as string[],
          value: 'Blended',
        },
        curve: {
          options: LEGACY_CURVE_OPTIONS as unknown as string[],
          value: 'EaseInOut',
        },
        scattering: {
          options: LEGACY_SCATTERING_OPTIONS as unknown as string[],
          value: 'PerlinAltitude',
        },
        easing: {
          options: LEGACY_EASING_OPTIONS as unknown as string[],
          value: 'Linear',
        },
      },
      { collapsed: false },
    ),
    Noise: folder(
      {
        amplitude: { value: 24, min: 1, max: 80, step: 1 },
        frequency: { value: 0.012, min: 0.002, max: 0.08, step: 0.001 },
        octaves: { value: 5, min: 1, max: 8, step: 1 },
        persistence: { value: 0.5, min: 0.2, max: 0.8, step: 0.01 },
        lacunarity: { value: 2, min: 1.2, max: 3, step: 0.1 },
      },
      { collapsed: false },
    ),
    Streaming: folder(
      {
        chunkSize: { value: 140, min: 64, max: 280, step: 1 },
        chunkSegments: { value: 96, min: 16, max: 192, step: 1 },
        viewRadius: { value: 2, min: 1, max: 4, step: 1 },
        cacheSize: { value: 96, min: 16, max: 192, step: 1 },
        maxInFlight: { value: 8, min: 1, max: 24, step: 1 },
      },
      { collapsed: false },
    ),
    Render: folder(
      {
        wireframe: false,
      },
      { collapsed: true },
    ),
  })

  const activeControls = useMemo(() => {
    if (presetControls.preset === 'Custom') {
      return controls as GeneratorControlValues
    }

    return {
      ...(controls as GeneratorControlValues),
      ...TERRAIN_PRESETS[presetControls.preset],
    } as GeneratorControlValues
  }, [controls, presetControls.preset])

  const postProcess = useMemo<PostProcessSettings>(
    () => mapSmoothingToPostProcess(activeControls.smoothing as LegacySmoothingOption),
    [activeControls.smoothing],
  )

  const settings = useMemo(
    () => ({
      easing: activeControls.easing as LegacyEasingOption,
      seed: activeControls.seed,
      heightmap: activeControls.heightmap as LegacyHeightmapOption,
      noiseAlgorithm: mapHeightmapToNoiseAlgorithm(
        activeControls.heightmap as LegacyHeightmapOption,
      ),
      smoothing: activeControls.smoothing as LegacySmoothingOption,
      texture: activeControls.texture as LegacyTextureOption,
      scattering: activeControls.scattering as LegacyScatteringOption,
      curve: activeControls.curve as LegacyCurveOption,
      chunkSize: activeControls.chunkSize,
      chunkSegments: activeControls.chunkSegments,
      viewRadius: activeControls.viewRadius,
      amplitude: activeControls.amplitude,
      frequency: activeControls.frequency,
      octaves: activeControls.octaves,
      persistence: activeControls.persistence,
      lacunarity: activeControls.lacunarity,
      postProcess,
      cacheSize: activeControls.cacheSize,
      maxInFlight: activeControls.maxInFlight,
      wireframe: activeControls.wireframe,
    }),
    [activeControls, postProcess],
  )

  const terrainKey = useMemo(
    () =>
      JSON.stringify({
        easing: settings.easing,
        seed: settings.seed,
        heightmap: settings.heightmap,
        noiseAlgorithm: settings.noiseAlgorithm,
        smoothing: settings.smoothing,
        texture: settings.texture,
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
        cacheSize: settings.cacheSize,
        maxInFlight: settings.maxInFlight,
      }),
    [settings],
  )

  return (
    <group>
      <InfiniteTerrain
        key={terrainKey}
        settings={settings}
        onPerfUpdate={onPerfUpdate}
        onHeightmapUpdate={onHeightmapUpdate}
        textureMode={settings.texture}
        showWater={showWater}
        waterOpacity={waterOpacity}
        waterDepthOpacityBoost={waterDepthOpacityBoost}
        waterReflection={waterReflection}
      />
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

function HeightmapOverlay({ preview }: { preview: HeightmapPreviewData | null }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas === null) {
      return
    }

    const context = canvas.getContext('2d')
    if (context === null) {
      return
    }

    const width = canvas.width
    const height = canvas.height
    const image = context.createImageData(width, height)

    if (preview === null) {
      image.data.fill(0)
      for (let i = 3; i < image.data.length; i += 4) {
        image.data[i] = 255
      }
      context.putImageData(image, 0, 0)
      return
    }

    let min = Number.POSITIVE_INFINITY
    let max = Number.NEGATIVE_INFINITY

    for (let i = 0; i < preview.heights.length; i += 1) {
      const value = preview.heights[i]
      if (value < min) min = value
      if (value > max) max = value
    }

    const range = max - min || 1

    for (let y = 0; y < height; y += 1) {
      const sampleY = Math.floor((y / (height - 1)) * (preview.side - 1))
      for (let x = 0; x < width; x += 1) {
        const sampleX = Math.floor((x / (width - 1)) * (preview.side - 1))
        const sourceIndex = sampleY * preview.side + sampleX
        const normalized = (preview.heights[sourceIndex] - min) / range
        const gray = Math.max(0, Math.min(255, Math.round(normalized * 255)))
        const pixelIndex = (y * width + x) * 4
        image.data[pixelIndex] = gray
        image.data[pixelIndex + 1] = gray
        image.data[pixelIndex + 2] = gray
        image.data[pixelIndex + 3] = 255
      }
    }

    context.putImageData(image, 0, 0)
  }, [preview])

  return (
    <aside className="heightmap-overlay" aria-live="polite">
      <h2>Heightmap</h2>
      <canvas ref={canvasRef} width={128} height={128} />
    </aside>
  )
}

function App() {
  const [perfStats, setPerfStats] = useState<PerfStats>(initialPerfStats)
  const [heightmapPreview, setHeightmapPreview] =
    useState<HeightmapPreviewData | null>(null)

  const displayControls = useControls('Display', {
    Overlays: folder(
      {
        showPerfDebug: { value: true, label: 'Perf debug' },
        showHeightmap: { value: true, label: 'Heightmap preview' },
      },
      { collapsed: false },
    ),
    Water: folder(
      {
        showWater: { value: true, label: 'Enable water' },
        waterOpacity: { value: 0.26, min: 0.05, max: 0.8, step: 0.01 },
        waterDepthOpacityBoost: { value: 0.56, min: 0, max: 1.2, step: 0.01 },
        waterReflection: { value: 0.26, min: 0, max: 1.1, step: 0.01 },
      },
      { collapsed: false },
    ),
  })

  const handlePerfUpdate = useCallback((stats: PerfStats) => {
    setPerfStats(stats)
  }, [])

  const handleHeightmapUpdate = useCallback((preview: HeightmapPreviewData | null) => {
    setHeightmapPreview(preview)
  }, [])

  return (
    <main className="app-shell">
      <header className="hud">
        <h1>Terrain Generator v2</h1>
        <p>Rendu moderne avec seed reproducible et controles live.</p>
      </header>
      {displayControls.showPerfDebug ? <PerformanceOverlay stats={perfStats} /> : null}
      {displayControls.showHeightmap ? <HeightmapOverlay preview={heightmapPreview} /> : null}
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
        <TerrainScene
          onPerfUpdate={handlePerfUpdate}
          onHeightmapUpdate={handleHeightmapUpdate}
          showWater={displayControls.showWater}
          waterOpacity={displayControls.waterOpacity}
          waterDepthOpacityBoost={displayControls.waterDepthOpacityBoost}
          waterReflection={displayControls.waterReflection}
        />
        <OrbitControls
          enablePan
          minDistance={45}
          maxDistance={520}
          maxPolarAngle={Math.PI * 0.49}
        />
      </Canvas>
      <div className="control-panel-shell" role="complementary" aria-label="Control panel">
        <Leva fill collapsed={false} titleBar={{ title: 'Control Panel' }} />
      </div>
    </main>
  )
}

export default App
