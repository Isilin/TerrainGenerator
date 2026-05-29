import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { Vector3 } from 'three'
import { OrbitControls as ThreeOrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { SCENE_CAMERA } from '../config'

const WORLD_UP = new Vector3(0, 1, 0)

const isTypingTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  const tagName = target.tagName
  return tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT' || target.isContentEditable
}

export function SceneCameraControls() {
  const camera = useThree((state) => state.camera)
  const gl = useThree((state) => state.gl)
  const controlsRef = useRef<ThreeOrbitControls | null>(null)
  const keysRef = useRef<Set<string>>(new Set())
  const forwardRef = useRef(new Vector3())
  const rightRef = useRef(new Vector3())
  const moveRef = useRef(new Vector3())

  useEffect(() => {
    const controls = new ThreeOrbitControls(camera, gl.domElement)
    controls.enablePan = true
    controls.minDistance = SCENE_CAMERA.controls.minDistance
    controls.maxDistance = SCENE_CAMERA.controls.maxDistance
    controls.maxPolarAngle = SCENE_CAMERA.controls.maxPolarAngle
    controls.enableDamping = true
    controlsRef.current = controls

    return () => {
      controls.dispose()
      controlsRef.current = null
    }
  }, [camera, gl])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) {
        return
      }

      keysRef.current.add(event.key.toLowerCase())
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      keysRef.current.delete(event.key.toLowerCase())
    }

    const handleBlur = () => {
      keysRef.current.clear()
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', handleBlur)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', handleBlur)
    }
  }, [])

  useFrame((_, delta) => {
    const controls = controlsRef.current
    if (controls === null) {
      return
    }

    const keys = keysRef.current
    let forwardInput = 0
    let strafeInput = 0

    if (keys.has('z') || keys.has('w') || keys.has('arrowup')) {
      forwardInput += 1
    }
    if (keys.has('s') || keys.has('arrowdown')) {
      forwardInput -= 1
    }
    if (keys.has('q') || keys.has('a') || keys.has('arrowleft')) {
      strafeInput -= 1
    }
    if (keys.has('d') || keys.has('arrowright')) {
      strafeInput += 1
    }

    if (forwardInput !== 0 || strafeInput !== 0) {
      const speedMultiplier = keys.has('shift') ? SCENE_CAMERA.controls.sprintMultiplier : 1
      const movementStep = SCENE_CAMERA.controls.moveSpeed * speedMultiplier * delta

      const forward = forwardRef.current
      const right = rightRef.current
      const move = moveRef.current

      camera.getWorldDirection(forward)
      forward.y = 0
      if (forward.lengthSq() > 0) {
        forward.normalize()
      }

      right.crossVectors(forward, WORLD_UP)
      if (right.lengthSq() > 0) {
        right.normalize()
      }

      move.set(0, 0, 0)
      move.addScaledVector(forward, forwardInput)
      move.addScaledVector(right, strafeInput)

      if (move.lengthSq() > 0) {
        move.normalize().multiplyScalar(movementStep)
        camera.position.add(move)
        controls.target.add(move)
      }
    }

    controls.update()
  })

  return null
}
