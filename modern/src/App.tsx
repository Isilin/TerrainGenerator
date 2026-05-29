import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Leva, useControls } from 'leva'
import { useMemo } from 'react'
import { BufferAttribute, PlaneGeometry } from 'three'
import { createNoise2D } from 'simplex-noise'
import './App.css'

const hashSeed = (input: string) => {
  let hash = 1779033703 ^ input.length
  for (let i = 0; i < input.length; i += 1) {
    hash = Math.imul(hash ^ input.charCodeAt(i), 3432918353)
    hash = (hash << 13) | (hash >>> 19)
  }
  return hash >>> 0
}

const mulberry32 = (seed: number) => {
  return () => {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function TerrainSurface() {
  const settings = useControls('Generator', {
    seed: 'terrain-v2',
    size: { value: 220, min: 64, max: 512, step: 1 },
    segments: { value: 180, min: 32, max: 256, step: 1 },
    amplitude: { value: 24, min: 1, max: 80, step: 1 },
    frequency: { value: 0.012, min: 0.002, max: 0.08, step: 0.001 },
    octaves: { value: 5, min: 1, max: 8, step: 1 },
    persistence: { value: 0.5, min: 0.2, max: 0.8, step: 0.01 },
    lacunarity: { value: 2, min: 1.2, max: 3, step: 0.1 },
    wireframe: false,
  })

  const geometry = useMemo(() => {
    const rng = mulberry32(hashSeed(settings.seed))
    const noise2d = createNoise2D(rng)
    const geo = new PlaneGeometry(
      settings.size,
      settings.size,
      settings.segments,
      settings.segments,
    )

    const position = geo.getAttribute('position') as BufferAttribute
    for (let i = 0; i < position.count; i += 1) {
      const x = position.getX(i)
      const y = position.getY(i)

      let value = 0
      let amplitude = 1
      let frequency = settings.frequency
      for (let octave = 0; octave < settings.octaves; octave += 1) {
        value += noise2d(x * frequency, y * frequency) * amplitude
        amplitude *= settings.persistence
        frequency *= settings.lacunarity
      }

      position.setZ(i, value * settings.amplitude)
    }

    position.needsUpdate = true
    geo.computeVertexNormals()
    geo.rotateX(-Math.PI / 2)
    return geo
  }, [settings])

  return (
    <mesh geometry={geometry} receiveShadow castShadow>
      <meshStandardMaterial
        color="#97a97c"
        roughness={0.92}
        metalness={0.05}
        wireframe={settings.wireframe}
      />
    </mesh>
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
        <TerrainSurface />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.15, 0]} receiveShadow>
          <planeGeometry args={[900, 900, 1, 1]} />
          <meshStandardMaterial color="#718355" roughness={1} metalness={0} />
        </mesh>
        <OrbitControls
          enablePan={false}
          minDistance={45}
          maxDistance={300}
          maxPolarAngle={Math.PI * 0.49}
        />
      </Canvas>
      <Leva collapsed={false} titleBar={{ title: 'Control Panel' }} />
    </main>
  )
}

export default App
