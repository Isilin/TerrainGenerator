export type HeightFieldOptions = {
  width: number
  height: number
}

const toIndex = (x: number, y: number, width: number) => y * width + x

const forNeighborhood = (
  x: number,
  y: number,
  width: number,
  height: number,
  callback: (nx: number, ny: number) => void,
) => {
  for (let dy = -1; dy <= 1; dy += 1) {
    for (let dx = -1; dx <= 1; dx += 1) {
      const nx = x + dx
      const ny = y + dy
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) {
        continue
      }
      callback(nx, ny)
    }
  }
}

export const smoothMean = (
  source: Float32Array,
  options: HeightFieldOptions,
  weight = 0,
) => {
  const result = new Float32Array(source.length)
  const blend = 1 / (1 + weight)

  for (let y = 0; y < options.height; y += 1) {
    for (let x = 0; x < options.width; x += 1) {
      let sum = 0
      let count = 0
      forNeighborhood(x, y, options.width, options.height, (nx, ny) => {
        sum += source[toIndex(nx, ny, options.width)]
        count += 1
      })

      const index = toIndex(x, y, options.width)
      const average = sum / count
      result[index] = (average + source[index] * weight) * blend
    }
  }

  return result
}

export const smoothMedian = (source: Float32Array, options: HeightFieldOptions) => {
  const result = new Float32Array(source.length)

  for (let y = 0; y < options.height; y += 1) {
    for (let x = 0; x < options.width; x += 1) {
      const values: number[] = []
      forNeighborhood(x, y, options.width, options.height, (nx, ny) => {
        values.push(source[toIndex(nx, ny, options.width)])
      })

      values.sort((a, b) => a - b)
      const middle = Math.floor(values.length * 0.5)
      const median =
        values.length % 2 === 1
          ? values[middle]
          : (values[middle - 1] + values[middle]) * 0.5

      result[toIndex(x, y, options.width)] = median
    }
  }

  return result
}

export const smoothConservative = (
  source: Float32Array,
  options: HeightFieldOptions,
  multiplier = 1,
) => {
  const result = new Float32Array(source.length)

  for (let y = 0; y < options.height; y += 1) {
    for (let x = 0; x < options.width; x += 1) {
      let min = Number.POSITIVE_INFINITY
      let max = Number.NEGATIVE_INFINITY

      forNeighborhood(x, y, options.width, options.height, (nx, ny) => {
        if (nx === x && ny === y) {
          return
        }

        const value = source[toIndex(nx, ny, options.width)]
        if (value < min) min = value
        if (value > max) max = value
      })

      const index = toIndex(x, y, options.width)
      const current = source[index]

      if (!Number.isFinite(min) || !Number.isFinite(max)) {
        result[index] = current
        continue
      }

      const halfRange = (max - min) * 0.5
      const middle = min + halfRange
      const scaledMax = middle + halfRange * multiplier
      const scaledMin = middle - halfRange * multiplier

      if (current > scaledMax) {
        result[index] = scaledMax
      } else if (current < scaledMin) {
        result[index] = scaledMin
      } else {
        result[index] = current
      }
    }
  }

  return result
}

export const clampHeights = (
  source: Float32Array,
  minHeight: number,
  maxHeight: number,
  easing: (value: number) => number = (value) => value,
) => {
  let min = Number.POSITIVE_INFINITY
  let max = Number.NEGATIVE_INFINITY

  for (let i = 0; i < source.length; i += 1) {
    const value = source[i]
    if (value < min) min = value
    if (value > max) max = value
  }

  if (max === min) {
    const fallback = Math.max(minHeight, Math.min(maxHeight, min))
    return new Float32Array(source.length).fill(fallback)
  }

  const sourceRange = max - min
  const targetRange = maxHeight - minHeight
  const result = new Float32Array(source.length)

  for (let i = 0; i < source.length; i += 1) {
    const normalized = (source[i] - min) / sourceRange
    result[i] = easing(normalized) * targetRange + minHeight
  }

  return result
}

export type PostProcessSettings =
  | { mode: 'none' }
  | { mode: 'mean'; weight: number }
  | { mode: 'median' }
  | { mode: 'conservative'; multiplier: number }

export const applyPostProcess = (
  source: Float32Array,
  options: HeightFieldOptions,
  settings: PostProcessSettings,
) => {
  if (settings.mode === 'none') {
    return source
  }

  if (settings.mode === 'mean') {
    return smoothMean(source, options, settings.weight)
  }

  if (settings.mode === 'median') {
    return smoothMedian(source, options)
  }

  return smoothConservative(source, options, settings.multiplier)
}
