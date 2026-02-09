import appConfig from '@/configs/app.config'
import { createServicesClient } from '@servilogics/shared/services'
import type { GetServicesParams, Service } from '@servilogics/shared/services'

const servicesClient = createServicesClient({ baseUrl: appConfig.apiPrefix })

export type { GetServicesParams, Service }

export async function getServices(params?: GetServicesParams): Promise<Service[]> {
    return servicesClient.getServices(params)
}

export async function getServiceById(serviceId: string): Promise<Service> {
    const service = await servicesClient.getServiceById(serviceId)
    if (!service) {
        throw new Error('Service not found')
    }
    return service
}
