import Constants from 'expo-constants'

export type ServiceCategory =
  | 'electrical-fencing'
  | 'surveillance-cameras'
  | 'painting'
  | 'air-conditioning'
  | 'preventive-maintenance'
  | 'home-emergency'
  | 'industrial'
  | 'commercial'

export type ServiceSector = 'home' | 'industrial' | 'commercial'

export interface Service {
  serviceId?: string
  id?: string
  name: string
  description: string
  category: ServiceCategory
  sector: ServiceSector[]
  basePrice: number
  currency: string
  estimatedDuration: string
  image?: string
  imageUrl?: string
  features: string[]
  available: boolean
}

function getApiBaseUrl() {
  const extra = Constants.expoConfig?.extra as { API_BASE_URL?: string } | undefined
  return extra?.API_BASE_URL || 'http://localhost:3001/api'
}

export async function getServices(): Promise<Service[]> {
  const baseUrl = getApiBaseUrl()
  const res = await fetch(`${baseUrl}/services`)

  if (!res.ok) {
    throw new Error('Failed to fetch services')
  }

  const json = await res.json() as { success?: boolean; data?: Service[] }
  if (json && json.success && Array.isArray(json.data)) {
    return json.data
  }

  return []
}

export async function getServiceById(serviceId: string): Promise<Service | null> {
  const baseUrl = getApiBaseUrl()
  const res = await fetch(`${baseUrl}/services/${encodeURIComponent(serviceId)}`)

  if (res.status === 404) {
    return null
  }

  if (!res.ok) {
    throw new Error('Failed to fetch service')
  }

  const json = await res.json() as { success?: boolean; data?: Service }
  if (json && json.success && json.data) {
    return json.data
  }

  return null
}
