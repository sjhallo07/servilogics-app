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
  id?: string
  serviceId?: string
  name: string
  description: string
  category: ServiceCategory
  sector: ServiceSector[]
  basePrice: number
  currency: string
  estimatedDuration?: string
  image?: string
  imageUrl?: string
  features?: string[]
  available?: boolean
}
