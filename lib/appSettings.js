import { getCollections } from './db'

const DEFAULTS = {
  default_model: 'google/gemini-flash-3',
  default_level: 'c2',
  custom_models: [],
  max_gradings_per_day: 2,
}

// In-process cache — cleared every 60 seconds
let _cache = null
let _cacheAt = 0
const TTL = 60_000

export async function getAppSettings() {
  if (_cache && Date.now() - _cacheAt < TTL) return _cache
  const { settings } = await getCollections()
  const doc = await settings.findOne({ _id: 'global' })
  _cache = { ...DEFAULTS, ...doc }
  _cacheAt = Date.now()
  return _cache
}

export function clearAppSettingsCache() {
  _cache = null
}
