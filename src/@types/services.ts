export type ServiceCategory =
    | 'electrical-fencing'
    | 'surveillance-cameras'
    | 'painting'
    | 'air-conditioning'
    | 'preventive-maintenance'
    | 'home-emergency'
    | 'industrial'
    | 'commercial'

export type ServiceSector = 'home' | 'industrial' | 'commercial'

export interface Service {
    id: string
    name: string
    description: string
    category: ServiceCategory
    sector: ServiceSector[]
    basePrice: number
    currency: string
    estimatedDuration: string
    image: string
    features: string[]
    available: boolean
}

export interface CartItem {
    service: Service
    quantity: number
    notes?: string
    scheduledDate?: string
}

export interface QuoteRequest {
    id: string
    userId: string
    services: CartItem[]
    status: 'pending' | 'reviewed' | 'quoted' | 'accepted' | 'rejected'
    inspectionDate?: string
    inspectionTime?: string
    address: string
    contactPhone: string
    contactEmail: string
    notes?: string
    createdAt: string
    updatedAt: string
    quotedPrice?: number
}

export type WorkerAvailability = 'available' | 'busy' | 'offline'
export type WorkerRole = 'admin' | 'staff' | 'client'

export interface Worker {
    id: string
    name: string
    avatar?: string
    specialties: ServiceCategory[]
    rating?: number
    reviewCount?: number
    availability: WorkerAvailability
    currentLocation?: {
        lat: number
        lng: number
    }
    zone: string
    phone?: string
    email?: string
    skills?: string[]
    experience?: number
    certifications?: string[]
    photo?: string
    role?: WorkerRole
    status?: string
}

export interface Feedback {
    id: string
    userId: string
    workerId: string
    serviceId: string
    rating: number
    comment: string
    createdAt: string
}

export interface LoyaltyProgram {
    userId: string
    points: number
    tier: 'bronze' | 'silver' | 'gold' | 'platinum'
    discountPercentage: number
    availableCoupons: Coupon[]
}

export interface Coupon {
    id: string
    code: string
    discountPercentage: number
    validUntil: string
    usedAt?: string
}

export interface InventoryItem {
    id: string
    name: string
    sku: string
    category: string
    quantity: number
    minQuantity: number
    price: number
    supplier: string
    lastRestocked: string
}

export interface JobStatus {
    id: string
    quoteId: string
    workerId: string
    status: 'assigned' | 'in-progress' | 'completed' | 'on-hold'
    startTime?: string
    endTime?: string
    notes: string[]
    partsUsed: { itemId: string; quantity: number }[]
}
