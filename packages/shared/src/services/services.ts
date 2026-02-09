import type { Service } from '../types/services'

export interface GetServicesParams {
  category?: string
  sector?: string
  available?: boolean
}

export interface ServicesClientOptions {
  baseUrl: string
  fetcher?: typeof fetch
}

interface ServicesApiResponse {
  success?: boolean
  data?: Service[]
  error?: string
}

interface ServiceApiResponse {
  success?: boolean
  data?: Service
  error?: string
}

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '')

const buildUrl = (baseUrl: string, path: string, params?: GetServicesParams) => {
  const url = new URL(`${trimTrailingSlash(baseUrl)}${path}`)

  if (params) {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined) {
        return
      }
      query.set(key, String(value))
    })

    const queryString = query.toString()
    if (queryString) {
      url.search = queryString
    }
  }

  return url.toString()
}

const parseServicesResponse = (body: unknown): Service[] => {
  if (Array.isArray(body)) {
    return body as Service[]
  }

  if (body && typeof body === 'object') {
    const typed = body as ServicesApiResponse
    if (typed.success && Array.isArray(typed.data)) {
      return typed.data
    }
  }

  return []
}

const parseServiceResponse = (body: unknown): Service | null => {
  if (!body) {
    return null
  }

  if (body && typeof body === 'object') {
    const typed = body as ServiceApiResponse
    if (typed.success && typed.data) {
      return typed.data
    }

    const maybeService = body as Service
    if (maybeService.name) {
      return maybeService
    }
  }

  return null
}

export const createServicesClient = ({ baseUrl, fetcher }: ServicesClientOptions) => {
  const fetchImpl = fetcher ?? fetch

  const getServices = async (params?: GetServicesParams): Promise<Service[]> => {
    const url = buildUrl(baseUrl, '/services', params)
    const response = await fetchImpl(url)

    if (!response.ok) {
      throw new Error(`Failed to fetch services: ${response.status}`)
    }

    const body = (await response.json()) as ServicesApiResponse | Service[]
    return parseServicesResponse(body)
  }

  const getServiceById = async (serviceId: string): Promise<Service | null> => {
    const url = buildUrl(baseUrl, `/services/${encodeURIComponent(serviceId)}`)
    const response = await fetchImpl(url)

    if (response.status === 404) {
      return null
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch service: ${response.status}`)
    }

    const body = (await response.json()) as ServiceApiResponse | Service
    return parseServiceResponse(body)
  }

  return {
    getServices,
    getServiceById,
  }
}
