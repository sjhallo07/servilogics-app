import Constants from 'expo-constants'

const extras = Constants.expoConfig?.extra || Constants.manifest?.extra || {}
const API_BASE = extras.API_BASE_URL || 'http://localhost:3001'

export async function getHealth() {
  const url = `${API_BASE.replace(/\/$/, '')}/api/health`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export default { getHealth }
