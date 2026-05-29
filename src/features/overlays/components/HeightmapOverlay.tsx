import { useEffect, useRef } from 'react'
import type { HeightmapPreviewData } from '../../terrain/types'
import styles from './Overlays.module.css'

export function HeightmapOverlay({
  preview,
}: {
  preview: HeightmapPreviewData | null
}) {
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
    <aside className={styles.heightmapOverlay} aria-live="polite">
      <h2>Heightmap</h2>
      <canvas ref={canvasRef} width={128} height={128} />
    </aside>
  )
}
