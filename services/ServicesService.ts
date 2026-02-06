import Constants from 'expo-constants'

export interface Service {
  id?: string
  serviceId?: string
  name: string
  description: string
  category: string
  sector: string[]
  basePrice: number
  currency: string
  estimatedDuration?: string
  image?: string
  features?: string[]
  available?: boolean
}

interface ServicesApiResponse {
  success: boolean
  data?: Service[]
  error?: string
  count?: number
}

const getApiBaseUrl = () => {
  const extra = Constants.expoConfig?.extra as { API_BASE_URL?: string } | undefined
  return extra?.API_BASE_URL ?? 'http://localhost:3001/api'
}

export async function getServices(): Promise<Service[]> {
  const baseUrl = getApiBaseUrl()
  const res = await fetch(`${baseUrl}/services`)

  if (!res.ok) {
    throw new Error(`Failed to fetch services: ${res.status}`)
  }

  const body = (await res.json()) as ServicesApiResponse | Service[]

  if (Array.isArray(body)) {
    return body
  }

  if (!body.success || !body.data) {
    throw new Error(body.error || 'Failed to fetch services')
  }

  return body.data
}

export async function getServiceById(serviceId: string): Promise<Service> {
  const baseUrl = getApiBaseUrl()
  const res = await fetch(`${baseUrl}/services/${encodeURIComponent(serviceId)}`)

  if (!res.ok) {
    throw new Error(`Failed to fetch service: ${res.status}`)
  }

  const body = (await res.json()) as { success: boolean; data?: Service; error?: string }

  if (!body.success || !body.data) {
    throw new Error(body.error || 'Failed to fetch service')
  }

  return body.data
}
