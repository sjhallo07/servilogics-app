import ApiService from './ApiService'
import endpointConfig from '@/configs/endpoint.config'

type ApiResponse<T> = {
    success: boolean
    data: T
    message?: string
    error?: string
}

export type ContactPayload = {
    name: string
    email: string
    phone: string
    subject: string
    message: string
}

const ContactService = {
    async submitContact(payload: ContactPayload) {
        const response = await ApiService.fetchDataWithAxios<ApiResponse<{ id: string }>>({
            url: endpointConfig.contact,
            method: 'post',
            data: payload,
        })
        if (!response?.success) {
            throw new Error(response?.error || 'Failed to submit contact message')
        }
        return response.data
    },
}

export default ContactService
