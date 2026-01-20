/**
 * Role-Based Access Control (RBAC) utilities
 */
import type { Worker } from '@/@types/services'

export type UserRole = 'admin' | 'staff' | 'client'

export interface Permission {
    canViewWorkers: boolean
    canViewWorkerDetails: boolean
    canCreateWorker: boolean
    canUpdateWorker: boolean
    canDeleteWorker: boolean
    canUpdateLocation: boolean
    canUpdateAvailability: boolean
    canUploadPhoto: boolean
    canManageZones: boolean
}

/**
 * Permission matrix for different roles
 */
const permissionMatrix: Record<UserRole, Permission> = {
    admin: {
        canViewWorkers: true,
        canViewWorkerDetails: true,
        canCreateWorker: true,
        canUpdateWorker: true,
        canDeleteWorker: true,
        canUpdateLocation: true,
        canUpdateAvailability: true,
        canUploadPhoto: true,
        canManageZones: true,
    },
    staff: {
        canViewWorkers: true,
        canViewWorkerDetails: true,
        canCreateWorker: false,
        canUpdateWorker: false, // Can only update own profile
        canDeleteWorker: false,
        canUpdateLocation: true, // Can update own location
        canUpdateAvailability: true, // Can update own availability
        canUploadPhoto: false,
        canManageZones: false,
    },
    client: {
        canViewWorkers: true, // Only available workers
        canViewWorkerDetails: false,
        canCreateWorker: false,
        canUpdateWorker: false,
        canDeleteWorker: false,
        canUpdateLocation: false,
        canUpdateAvailability: false,
        canUploadPhoto: false,
        canManageZones: false,
    },
}

/**
 * Get permissions for a user role
 */
export const getPermissions = (role: UserRole): Permission => {
    return permissionMatrix[role] || permissionMatrix.client
}

/**
 * Check if user can perform an action
 */
export const canPerform = (role: UserRole, action: keyof Permission): boolean => {
    const permissions = getPermissions(role)
    return permissions[action] as boolean
}

/**
 * Get user role from localStorage
 */
export const getUserRole = (): UserRole => {
    try {
        const auth = localStorage.getItem('auth')
        if (auth) {
            const authData = JSON.parse(auth)
            return authData.role || 'client'
        }
    } catch (error) {
        console.error('Error getting user role:', error)
    }
    return 'client'
}

/**
 * Get current user ID
 */
export const getCurrentUserId = (): string | null => {
    try {
        const auth = localStorage.getItem('auth')
        if (auth) {
            const authData = JSON.parse(auth)
            return authData.userId || null
        }
    } catch (error) {
        console.error('Error getting user ID:', error)
    }
    return null
}

/**
 * Check if user is owner of worker profile
 */
export const isWorkerOwner = (workerId: string, userId: string | null): boolean => {
    return workerId === userId
}

/**
 * Get role label for display
 */
export const getRoleLabel = (role: UserRole): string => {
    const labels: Record<UserRole, string> = {
        admin: 'Administrator',
        staff: 'Staff Member',
        client: 'Client',
    }
    return labels[role] || 'User'
}

/**
 * Role-based hooks for React components
 */
export const useRBAC = () => {
    const role = getUserRole()
    const userId = getCurrentUserId()
    const permissions = getPermissions(role)

    return {
        role,
        userId,
        permissions,
        can: (action: keyof Permission) => permissions[action] as boolean,
        isAdmin: role === 'admin',
        isStaff: role === 'staff',
        isClient: role === 'client',
        isOwner: (workerId: string) => isWorkerOwner(workerId, userId),
    }
}

/**
 * Filter workers based on user role
 */
export const filterWorkersByRole = (workers: Worker[], role: UserRole): Worker[] => {
    if (role === 'client') {
        // Clients only see available and busy workers
        return workers.filter((w) => w.availability !== 'offline')
    }
    // Staff and admin see all workers
    return workers
}

/**
 * Get visible worker fields based on role
 */
export const getVisibleFields = (role: UserRole) => {
    const commonFields = ['id', 'name', 'specialties', 'availability', 'zone']

    if (role === 'admin') {
        return [
            ...commonFields,
            'rating',
            'reviewCount',
            'phone',
            'email',
            'currentLocation',
            'photo',
            'role',
            'status',
            'skills',
            'experience',
            'certifications'
        ]
    }

    if (role === 'staff') {
        return [
            ...commonFields,
            'rating',
            'reviewCount',
            'phone',
            'currentLocation',
            'photo'
        ]
    }

    // Client
    return [
        ...commonFields,
        'rating',
        'reviewCount',
        'photo'
    ]
}

export default {
    getPermissions,
    canPerform,
    getUserRole,
    getCurrentUserId,
    isWorkerOwner,
    getRoleLabel,
    useRBAC,
    filterWorkersByRole,
    getVisibleFields
}
