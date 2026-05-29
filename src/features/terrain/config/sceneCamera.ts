export const SCENE_CAMERA = {
  position: [0, 85, 140] as [number, number, number],
  fov: 48,
  near: 0.1,
  far: 2000,
  controls: {
    minDistance: 45,
    maxDistance: 520,
    maxPolarAngle: Math.PI * 0.49,
    moveSpeed: 120,
    sprintMultiplier: 2,
  },
} as const
