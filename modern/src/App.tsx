import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Leva, useControls } from 'leva'
import { useMemo, useState } from 'react'
import { createChunkGeometry, type TerrainChunkSettings } from './lib/terrain'
import './App.css'

const getChunkId = (x: number, z: number) => `${x}:${z}`

function TerrainChunk({
  chunkX,
  chunkZ,
  settings,
}: {
  chunkX: number
  chunkZ: number
  settings: TerrainChunkSettings
}) {
  const geometry = useMemo(
    () => createChunkGeometry(chunkX, chunkZ, settings),
    [chunkX, chunkZ, settings],
  )

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

  useFrame(({ camera }) => {
    const x = Math.round(camera.position.x / settings.chunkSize)
    const z = Math.round(camera.position.z / settings.chunkSize)
    if (x !== centerChunk.x || z !== centerChunk.z) {
      setCenterChunk({ x, z })
    }
  })

  const chunks = useMemo(() => {
    const next: Array<{ x: number; z: number; id: string }> = []
    for (let dz = -settings.viewRadius; dz <= settings.viewRadius; dz += 1) {
      for (let dx = -settings.viewRadius; dx <= settings.viewRadius; dx += 1) {
        const x = centerChunk.x + dx
        const z = centerChunk.z + dz
        next.push({ x, z, id: getChunkId(x, z) })
      }
    }
    return next
  }, [centerChunk, settings.viewRadius])

  return (
    <group>
      {chunks.map((chunk) => (
        <TerrainChunk
          key={chunk.id}
          chunkX={chunk.x}
          chunkZ={chunk.z}
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
      wireframe: controls.wireframe,
    }),
    [controls],
  )

  return (
    <group>
      <InfiniteTerrain settings={settings} />
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
