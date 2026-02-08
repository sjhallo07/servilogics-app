import ApiService from './ApiService'
import endpointConfig from '@/configs/endpoint.config'

type ApiResponse<T> = {
    success: boolean
    data: T
    message?: string
    error?: string
}

export type QuoteRequestPayload = {
    items: Array<{
        serviceId: string
        name: string
        quantity: number
        unitPrice: number
    }>
    total: number
    address: string
    phone: string
    email: string
    inspectionDate?: string
    inspectionTime?: string
    notes?: string
    needsInspection: boolean
}

export type Quote = {
    id: string
    customer: string
    service: string
    status: string
    amount: number
    date: string
}

const QuotesService = {
    async getQuotes() {
        const response = await ApiService.fetchDataWithAxios<ApiResponse<Quote[]>>({
            url: endpointConfig.quotes,
            method: 'get',
        })
        if (!response?.success) {
            throw new Error(response?.error || 'Failed to load quotes')
        }
        return response.data || []
    },
    async submitQuote(payload: QuoteRequestPayload) {
        const response = await ApiService.fetchDataWithAxios<ApiResponse<Quote>>({
            url: endpointConfig.quotes,
            method: 'post',
            data: payload,
        })
        if (!response?.success) {
            throw new Error(response?.error || 'Failed to submit quote')
        }
        return response.data
    },
}

export default QuotesService
