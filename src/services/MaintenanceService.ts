import ApiService from './ApiService'
import endpointConfig from '@/configs/endpoint.config'

export type MaintenanceEntry = {
    id: string
    clientId: string
    serviceType: string
    date: string
    technician?: string
    status?: string
    cost?: number
    notes?: string
    nextServiceDate?: string | null
    attachments?: { type: string; label?: string; url: string }[]
    createdAt?: string
}

type ApiResponse<T> = {
    success: boolean
    data: T
    message?: string
    error?: string
    count?: number
}

const getUserRole = () => {
    const auth = localStorage.getItem('auth')
    if (auth) {
        try {
            const authData = JSON.parse(auth)
            return authData.role || 'client'
        } catch {
            return 'client'
        }
    }
    return 'client'
}

const MaintenanceService = {
    async getClientMaintenance(clientId: string) {
        const response = await ApiService.fetchDataWithAxios<ApiResponse<MaintenanceEntry[]>>({
            url: `${endpointConfig.clients}/${clientId}/maintenance`,
            method: 'get',
        })
        if (!response?.success) {
            throw new Error(response?.error || 'Failed to load maintenance history')
        }
        return response.data || []
    },
    async addMaintenance(clientId: string, payload: Partial<MaintenanceEntry>) {
        const response = await ApiService.fetchDataWithAxios<ApiResponse<MaintenanceEntry>>({
            url: `${endpointConfig.clients}/${clientId}/maintenance`,
            method: 'post',
            params: { role: getUserRole() },
            data: payload,
        })
        if (!response?.success) {
            throw new Error(response?.error || 'Failed to add maintenance')
        }
        return response.data
    },
}

export default MaintenanceService
