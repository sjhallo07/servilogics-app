import ApiService from './ApiService'

export type HealthResponse = {
    status: string
    message?: string
    version?: string
    timestamp?: string
}

export async function apiHealth() {
    return ApiService.fetchDataWithAxios<HealthResponse>({
        url: '/health',
        method: 'get',
    })
}

export default { apiHealth }
