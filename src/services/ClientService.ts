import ApiService from './ApiService'
import endpointConfig from '@/configs/endpoint.config'

export type ClientAttachment = {
    type: string
    label?: string
    url: string
}

export type ClientWorkHistory = {
    id?: string
    title: string
    date?: string
    status?: string
    amount?: number
}

export type Client = {
    id: string
    firstName: string
    lastName: string
    fullName?: string
    phone?: string
    email?: string
    address?: string
    city?: string
    state?: string
    country?: string
    zip?: string
    jobTypes?: string[]
    purchases?: string[]
    invoices?: string[]
    workHistory?: ClientWorkHistory[]
    lastMaintenanceAt?: string | null
    nextMaintenanceAt?: string | null
    notes?: string
    attachments?: ClientAttachment[]
    createdAt?: string
    updatedAt?: string
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

const ClientService = {
    async getClients() {
        const response = await ApiService.fetchDataWithAxios<ApiResponse<Client[]>>({
            url: endpointConfig.clients,
            method: 'get',
        })
        if (!response?.success) {
            throw new Error(response?.error || 'Failed to load clients')
        }
        return response.data || []
    },
    async getClient(id: string) {
        const response = await ApiService.fetchDataWithAxios<ApiResponse<Client>>({
            url: `${endpointConfig.clients}/${id}`,
            method: 'get',
        })
        if (!response?.success) {
            throw new Error(response?.error || 'Failed to load client')
        }
        return response.data
    },
    async createClient(payload: Partial<Client>) {
        const response = await ApiService.fetchDataWithAxios<ApiResponse<Client>>({
            url: endpointConfig.clients,
            method: 'post',
            params: { role: getUserRole() },
            data: payload,
        })
        if (!response?.success) {
            throw new Error(response?.error || 'Failed to create client')
        }
        return response.data
    },
    async updateClient(id: string, payload: Partial<Client>) {
        const response = await ApiService.fetchDataWithAxios<ApiResponse<Client>>({
            url: `${endpointConfig.clients}/${id}`,
            method: 'put',
            params: { role: getUserRole() },
            data: payload,
        })
        if (!response?.success) {
            throw new Error(response?.error || 'Failed to update client')
        }
        return response.data
    },
    async importClients(file: File) {
        const formData = new FormData()
        formData.append('file', file)

        const response = await ApiService.fetchDataWithAxios<ApiResponse<Client[]>>({
            url: endpointConfig.clientsImport,
            method: 'post',
            params: { role: getUserRole() },
            data: formData as unknown as Record<string, unknown>,
            headers: { 'Content-Type': 'multipart/form-data' },
        })

        if (!response?.success) {
            throw new Error(response?.error || 'Failed to import clients')
        }

        return response
    },
    async importClientsCsv(csv: string) {
        const response = await ApiService.fetchDataWithAxios<ApiResponse<Client[]>>({
            url: endpointConfig.clientsImport,
            method: 'post',
            params: { role: getUserRole() },
            data: { csv },
        })

        if (!response?.success) {
            throw new Error(response?.error || 'Failed to import clients')
        }

        return response
    },
}

export default ClientService
