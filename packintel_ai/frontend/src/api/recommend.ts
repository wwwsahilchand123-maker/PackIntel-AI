import apiClient from './client'
import { RecommendRequest, RecommendResponse } from '@/types/recommendation'

export const recommendApi = {
  create: async (payload: RecommendRequest): Promise<RecommendResponse> => {
    const response = await apiClient.post('/api/v1/recommend', payload)
    return response.data
  },

  getById: async (queryId: string): Promise<RecommendResponse> => {
    const response = await apiClient.get(`/api/v1/recommend/${queryId}`)
    return response.data
  },
}
