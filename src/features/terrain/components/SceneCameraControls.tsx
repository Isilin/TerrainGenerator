import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { OrbitControls as ThreeOrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export function SceneCameraControls() {
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
