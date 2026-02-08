import ApiService from './ApiService'
import endpointConfig from '@/configs/endpoint.config'

type ApiResponse<T> = {
    success: boolean
    data: T
    message?: string
    error?: string
}

export type Job = {
    id: string
    customer: string
    worker: string
    service: string
    status: string
    progress: number
}

const JobsService = {
    async getJobs() {
        const response = await ApiService.fetchDataWithAxios<ApiResponse<Job[]>>({
            url: endpointConfig.jobs,
            method: 'get',
        })
        if (!response?.success) {
            throw new Error(response?.error || 'Failed to load jobs')
        }
        return response.data || []
    },
}

export default JobsService
