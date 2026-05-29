import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Leva } from 'leva'
import { useCallback, useEffect, useRef, useState } from 'react'
import { OrbitControls as ThreeOrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import styles from './App.module.css'
import { useDisplayControls } from './features/display'
import { HeightmapOverlay, PerformanceOverlay } from './features/overlays'
import { TerrainScene, initialPerfStats, type HeightmapPreviewData, type PerfStats } from './features/terrain'

function CameraOrbitControls() {
  const camera = useThree((state) => state.camera)
  const gl = useThree((state) => state.gl)
  const controlsRef = useRef<ThreeOrbitControls | null>(null)

  useEffect(() => {
    const controls = new ThreeOrbitControls(camera, gl.domElement)
    controls.enablePan = true
    controls.minDistance = 45
    controls.maxDistance = 520
    controls.maxPolarAngle = Math.PI * 0.49
    controls.enableDamping = true
    controlsRef.current = controls

    return () => {
      controls.dispose()
      controlsRef.current = null
    }
  }, [camera, gl])

  useFrame(() => {
    controlsRef.current?.update()
  })

  return null
}

function App() {
  const [perfStats, setPerfStats] = useState<PerfStats>(initialPerfStats)
  const [heightmapPreview, setHeightmapPreview] =
    useState<HeightmapPreviewData | null>(null)

  const displayControls = useDisplayControls()

  const handlePerfUpdate = useCallback((stats: PerfStats) => {
    setPerfStats(stats)
  }, [])

  const handleHeightmapUpdate = useCallback((preview: HeightmapPreviewData | null) => {
    setHeightmapPreview(preview)
  }, [])

  return (
    <main className={styles.appShell}>
      <header className={styles.hud}>
        <h1>Terrain Generator v2</h1>
        <p>Rendu moderne avec seed reproducible et controles live.</p>
      </header>
      {displayControls.showPerfDebug ? <PerformanceOverlay stats={perfStats} /> : null}
      {displayControls.showHeightmap ? <HeightmapOverlay preview={heightmapPreview} /> : null}
      <Canvas
        className={styles.viewport}
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
          waterWaveSpeed={displayControls.waterWaveSpeed}
          waterWaveAmplitude={displayControls.waterWaveAmplitude}
          waterWaveFrequency={displayControls.waterWaveFrequency}
        />
        <CameraOrbitControls />
      </Canvas>
      <div className={styles.controlPanelShell} role="complementary" aria-label="Control panel">
        <Leva fill collapsed={false} titleBar={{ title: 'Control Panel' }} />
      </div>
    </main>
  )
}

export default App
