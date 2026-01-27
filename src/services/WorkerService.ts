import { workersData as mockWorkers } from '@/data/services.data'
import axios from 'axios'

const API_BASE_URL = '/api/workers'

// Get current user role from auth context or localStorage
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

const getUserId = () => {
    const auth = localStorage.getItem('auth')
    if (auth) {
        try {
            const authData = JSON.parse(auth)
            return authData.userId || null
        } catch {
            return null
        }
    }
    return null
}

// Create axios instance with role params
const createRequest = (config = {}) => {
    return {
        ...config,
        params: {
            ...config.params,
            role: getUserRole(),
            userId: getUserId()
        }
    }
}

/**
 * Get all workers
 */
export const getWorkers = async () => {
    try {
        const response = await axios.get(API_BASE_URL, createRequest())
        return response.data
    } catch (error) {
        console.error('Error fetching workers:', error)
        // Frontend fallback: use mock workers so UI remains functional when backend is down
        return { success: true, data: mockWorkers, count: mockWorkers.length, fallback: true }
    }
}

/**
 * Get single worker by ID
 */
export const getWorkerById = async (workerId) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/${workerId}`,
            createRequest()
        )
        return response.data
    } catch (error) {
        console.error('Error fetching worker:', error)
        throw error
    }
}

/**
 * Create new worker (admin only)
 */
export const createWorker = async (workerData) => {
    try {
        const response = await axios.post(
            API_BASE_URL,
            workerData,
            createRequest()
        )
        return response.data
    } catch (error) {
        console.error('Error creating worker:', error)
        throw error
    }
}

/**
 * Update worker details
 */
export const updateWorker = async (workerId, updateData) => {
    try {
        const response = await axios.put(
            `${API_BASE_URL}/${workerId}`,
            updateData,
            createRequest()
        )
        return response.data
    } catch (error) {
        console.error('Error updating worker:', error)
        throw error
    }
}

/**
 * Update worker location (real-time)
 */
export const updateWorkerLocation = async (workerId, lat, lng) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/${workerId}/location`,
            { lat, lng },
            createRequest()
        )
        return response.data
    } catch (error) {
        console.error('Error updating location:', error)
        throw error
    }
}

/**
 * Update worker availability
 */
export const updateWorkerAvailability = async (workerId, availability) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/${workerId}/availability`,
            { availability },
            createRequest()
        )
        return response.data
    } catch (error) {
        console.error('Error updating availability:', error)
        throw error
    }
}

/**
 * Send heartbeat (presence) for a worker (admin/staff)
 */
export const heartbeatWorker = async (workerId: string) => {
    try {
        const response = await axios.post(
            `${API_BASE_URL}/${workerId}/heartbeat`,
            {},
            createRequest()
        )
        return response.data
    } catch (error) {
        console.error('Error sending heartbeat:', error)
        throw error
    }
}

/**
 * Upload worker photo
 */
export const uploadWorkerPhoto = async (workerId, file) => {
    try {
        const formData = new FormData()
        formData.append('photo', file)

        const response = await axios.post(
            `${API_BASE_URL}/${workerId}/photo`,
            formData,
            createRequest({
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
        )
        return response.data
    } catch (error) {
        console.error('Error uploading photo:', error)
        throw error
    }
}

/**
 * Delete worker (admin only)
 */
export const deleteWorker = async (workerId) => {
    try {
        const response = await axios.delete(
            `${API_BASE_URL}/${workerId}`,
            createRequest()
        )
        return response.data
    } catch (error) {
        console.error('Error deleting worker:', error)
        throw error
    }
}

/**
 * Get all zones
 */
export const getZones = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/zones/list`)
        return response.data
    } catch (error) {
        console.error('Error fetching zones:', error)
        throw error
    }
}

export default {
    getWorkers,
    getWorkerById,
    createWorker,
    updateWorker,
    updateWorkerLocation,
    updateWorkerAvailability,
    heartbeatWorker,
    uploadWorkerPhoto,
    deleteWorker,
    getZones
}
