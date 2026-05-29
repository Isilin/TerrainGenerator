import type { DisplayControlsState } from '../display/types'
import type { GeneratorControlValues, TerrainPresetName } from '../terrain/types'

export type SceneUrlState = {
  terrain?: Partial<GeneratorControlValues> & {
    preset?: TerrainPresetName
  }
  display?: Partial<DisplayControlsState>
}

const QUERY_PREFIX = 'terrain'
const QUERY_KEYS = [
  'preset',
  'seed',
  'heightmap',
  'smoothing',
  'texture',
  'curve',
  'scattering',
  'easing',
  'amplitude',
  'frequency',
  'octaves',
  'persistence',
  'lacunarity',
  'chunkSize',
  'chunkSegments',
  'viewRadius',
  'cacheSize',
  'maxInFlight',
  'wireframe',
  'showPerfDebug',
  'showHeightmap',
  'showWater',
  'waterOpacity',
  'waterDepthOpacityBoost',
  'waterReflection',
] as const

const parseBoolean = (value: string | null, fallback: boolean) => {
  if (value === null) {
    return fallback
  }
  return value === '1' || value === 'true'
}

const stringifyBoolean = (value: boolean) => (value ? '1' : '0')

export const parseSceneUrlState = (search: string): SceneUrlState => {
  const params = new URLSearchParams(search)
  const terrain: SceneUrlState['terrain'] = {}
  const display: SceneUrlState['display'] = {}
  let hasTerrain = false
  let hasDisplay = false

  const preset = params.get(`${QUERY_PREFIX}.preset`)
  if (preset !== null) {
    terrain.preset = preset as TerrainPresetName
    hasTerrain = true
  }

  const textKeys: Array<keyof GeneratorControlValues> = [
    'seed',
    'heightmap',
    'smoothing',
    'texture',
    'curve',
    'scattering',
    'easing',
  ]
  for (const key of textKeys) {
    const value = params.get(`${QUERY_PREFIX}.${key}`)
    if (value !== null) {
      terrain[key] = value as never
      hasTerrain = true
    }
  }

  const numberKeys: Array<keyof GeneratorControlValues> = [
    'amplitude',
    'frequency',
    'octaves',
    'persistence',
    'lacunarity',
    'chunkSize',
    'chunkSegments',
    'viewRadius',
    'cacheSize',
    'maxInFlight',
  ]
  for (const key of numberKeys) {
    const value = params.get(`${QUERY_PREFIX}.${key}`)
    if (value !== null) {
      const parsed = Number(value)
      if (Number.isFinite(parsed)) {
        terrain[key] = parsed as never
        hasTerrain = true
      }
    }
  }

  const wireframe = params.get(`${QUERY_PREFIX}.wireframe`)
  if (wireframe !== null) {
    terrain.wireframe = parseBoolean(wireframe, false)
    hasTerrain = true
  }

  const displayBooleanKeys: Array<keyof DisplayControlsState> = [
    'showPerfDebug',
    'showHeightmap',
    'showWater',
  ]
  for (const key of displayBooleanKeys) {
    const value = params.get(`${QUERY_PREFIX}.${key}`)
    if (value !== null) {
      display[key] = parseBoolean(value, true) as never
      hasDisplay = true
    }
  }

  const displayNumberKeys: Array<keyof DisplayControlsState> = [
    'waterOpacity',
    'waterDepthOpacityBoost',
    'waterReflection',
  ]
  for (const key of displayNumberKeys) {
    const value = params.get(`${QUERY_PREFIX}.${key}`)
    if (value !== null) {
      const parsed = Number(value)
      if (Number.isFinite(parsed)) {
        display[key] = parsed as never
        hasDisplay = true
      }
    }
  }

  return {
    terrain: hasTerrain ? terrain : undefined,
    display: hasDisplay ? display : undefined,
  }
}

export const serializeSceneUrlState = (state: SceneUrlState) => {
  const params = new URLSearchParams()
  const terrain = state.terrain
  const display = state.display

  if (terrain !== undefined) {
    if (terrain.preset !== undefined) {
      params.set(`${QUERY_PREFIX}.preset`, terrain.preset)
    }

    const textKeys: Array<keyof GeneratorControlValues> = [
      'seed',
      'heightmap',
      'smoothing',
      'texture',
      'curve',
      'scattering',
      'easing',
    ]
    for (const key of textKeys) {
      const value = terrain[key]
      if (typeof value === 'string') {
        params.set(`${QUERY_PREFIX}.${key}`, value)
      }
    }

    const numberKeys: Array<keyof GeneratorControlValues> = [
      'amplitude',
      'frequency',
      'octaves',
      'persistence',
      'lacunarity',
      'chunkSize',
      'chunkSegments',
      'viewRadius',
      'cacheSize',
      'maxInFlight',
    ]
    for (const key of numberKeys) {
      const value = terrain[key]
      if (typeof value === 'number' && Number.isFinite(value)) {
        params.set(`${QUERY_PREFIX}.${key}`, String(value))
      }
    }

    if (typeof terrain.wireframe === 'boolean') {
      params.set(`${QUERY_PREFIX}.wireframe`, stringifyBoolean(terrain.wireframe))
    }
  }

  if (display !== undefined) {
    const displayBooleanKeys: Array<keyof DisplayControlsState> = [
      'showPerfDebug',
      'showHeightmap',
      'showWater',
    ]
    for (const key of displayBooleanKeys) {
      const value = display[key]
      if (typeof value === 'boolean') {
        params.set(`${QUERY_PREFIX}.${key}`, stringifyBoolean(value))
      }
    }

    const displayNumberKeys: Array<keyof DisplayControlsState> = [
      'waterOpacity',
      'waterDepthOpacityBoost',
      'waterReflection',
    ]
    for (const key of displayNumberKeys) {
      const value = display[key]
      if (typeof value === 'number' && Number.isFinite(value)) {
        params.set(`${QUERY_PREFIX}.${key}`, String(value))
      }
    }
  }

  const query = params.toString()
  return query.length > 0 ? `?${query}` : ''
}

export const collectShareableQueryKeys = () => QUERY_KEYS
