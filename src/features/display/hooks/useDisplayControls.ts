import { folder, useControls } from 'leva'

export const useDisplayControls = () => {
  return useControls('Display', {
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
}
