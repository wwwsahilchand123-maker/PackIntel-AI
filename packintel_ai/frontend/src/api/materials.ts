import apiClient from './client'
import { MaterialDetail } from '@/types/materials'
export type { DocumentMeta } from './knowledgeBase'

export interface MaterialListResponse {
  materials: MaterialDetail[]
  total: number
}

export interface FoodProfile {
  id: string
  commodity: string
  category: string
  moisture_sensitivity: number
  oxygen_sensitivity: number
  temperature_min: number
  temperature_max: number
  humidity_min?: number
  humidity_max?: number
  shelf_life_days: number
  sustainability_preference?: string
  special_requirements?: string
}

export interface FoodCategory {
  id: string
  label: string
}

export interface FoodProfilesResponse {
  categories: FoodCategory[]
  profiles: FoodProfile[]
  total: number
}

export const materialsApi = {
  list: async (params?: {
    category?: string
    sort_by?: string
    order?: string
  }): Promise<MaterialListResponse> => {
    const response = await apiClient.get('/api/v1/materials', { params })
    return response.data
  },

  getById: async (materialId: string): Promise<MaterialDetail & {
    applications?: string[]
    not_suitable_for?: string[]
    regulatory?: string
    sustainability_notes?: string
  }> => {
    const response = await apiClient.get(`/api/v1/materials/${materialId}`)
    return response.data
  },

  getFoodProfiles: async (search?: string): Promise<FoodProfilesResponse> => {
    const params = search ? { q: search } : {}
    const response = await apiClient.get('/api/v1/food-profiles', { params })
    return response.data
  },
}
