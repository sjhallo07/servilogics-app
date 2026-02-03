import Constants from 'expo-constants'

const extras = Constants.expoConfig?.extra || Constants.manifest?.extra || {}
// Priority: Expo Extra (from .env) -> Fallback localhost
const API_BASE = (extras.API_BASE_URL || 'http://localhost:3001').replace(/\/$/, '')

const getFullUrl = (path) => `${API_BASE}/api/${path.replace(/^\//, '')}`

export async function getHealth() {
  const res = await fetch(getFullUrl('health'))
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function getWorkers() {
  const res = await fetch(getFullUrl('workers'))
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export default { getHealth, getWorkers }
