import ApiService from './ApiService'
import endpointConfig from '@/configs/endpoint.config'

type ApiResponse<T> = {
    success: boolean
    data: T
    message?: string
    error?: string
}

export type LoyaltyProfile = {
    points: number
    tier: string
    discountPercentage: number
    coupons: Array<{
        id: string
        code: string
        discount: number
        validUntil: string
        used: boolean
    }>
}

export type FeedbackPayload = {
    rating: number
    message: string
}

const FeedbackService = {
    async getLoyalty() {
        const response = await ApiService.fetchDataWithAxios<ApiResponse<LoyaltyProfile>>({
            url: endpointConfig.loyalty,
            method: 'get',
        })
        if (!response?.success) {
            throw new Error(response?.error || 'Failed to load loyalty data')
        }
        return response.data
    },
    async submitFeedback(payload: FeedbackPayload) {
        const response = await ApiService.fetchDataWithAxios<ApiResponse<LoyaltyProfile>>({
            url: endpointConfig.feedback,
            method: 'post',
            data: payload,
        })
        if (!response?.success) {
            throw new Error(response?.error || 'Failed to submit feedback')
        }
        return response.data
    },
}

export default FeedbackService
