import Constants from 'expo-constants'
import { createServicesClient } from '@servilogics/shared/services'
import type { Service, ServiceCategory, ServiceSector } from '@servilogics/shared/types'

const getApiBaseUrl = () => {
  const extra = Constants.expoConfig?.extra as { API_BASE_URL?: string } | undefined
  return extra?.API_BASE_URL || 'http://localhost:3001/api'
}

const servicesClient = createServicesClient({ baseUrl: getApiBaseUrl() })

export type { Service, ServiceCategory, ServiceSector }

export async function getServices(): Promise<Service[]> {
  return servicesClient.getServices()
}

export async function getServiceById(serviceId: string): Promise<Service | null> {
  return servicesClient.getServiceById(serviceId)
}
