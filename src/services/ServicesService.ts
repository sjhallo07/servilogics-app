import type { Service } from '@/@types/services'
import ApiService from './ApiService'

export interface GetServicesParams {
    category?: string
    sector?: string
    available?: boolean
}

export async function getServices(params?: GetServicesParams): Promise<Service[]> {
    const response = await ApiService.fetchDataWithAxios<Service[]>({
        url: '/services',
        method: 'get',
        params,
    })
    return response
}

export async function getServiceById(serviceId: string): Promise<Service> {
    const response = await ApiService.fetchDataWithAxios<Service>({
        url: `/services/${serviceId}`,
        method: 'get',
    })
    return response
}
