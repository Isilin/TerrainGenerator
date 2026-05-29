import { Canvas } from '@react-three/fiber'
import { Leva } from 'leva'
import { useCallback, useMemo, useState } from 'react'
import styles from './App.module.css'
import { useDisplayControls } from './features/display'
import { HeightmapOverlay, PerformanceOverlay } from './features/overlays'
import {
  SCENE_CAMERA,
  SceneCameraControls,
  TerrainScene,
  initialPerfStats,
  type HeightmapPreviewData,
  type PerfStats,
  type WaterRenderConfig,
} from './features/terrain'

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

  const waterConfig = useMemo<WaterRenderConfig>(
    () => ({
      showWater: displayControls.showWater,
      opacity: displayControls.waterOpacity,
      depthOpacityBoost: displayControls.waterDepthOpacityBoost,
      reflection: displayControls.waterReflection,
      waveSpeed: displayControls.waterWaveSpeed,
      waveAmplitude: displayControls.waterWaveAmplitude,
      waveFrequency: displayControls.waterWaveFrequency,
    }),
    [
      displayControls.showWater,
      displayControls.waterOpacity,
      displayControls.waterDepthOpacityBoost,
      displayControls.waterReflection,
      displayControls.waterWaveSpeed,
      displayControls.waterWaveAmplitude,
      displayControls.waterWaveFrequency,
    ],
  )

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
        camera={{
          position: SCENE_CAMERA.position,
          fov: SCENE_CAMERA.fov,
          near: SCENE_CAMERA.near,
          far: SCENE_CAMERA.far,
        }}
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
          water={waterConfig}
        />
        <SceneCameraControls />
      </Canvas>
      <div className={styles.controlPanelShell} role="complementary" aria-label="Control panel">
        <Leva fill collapsed={false} titleBar={{ title: 'Control Panel' }} />
      </div>
    </main>
  )
}

export default App
