import apiClient from './client'
import { RecommendRequest } from '@/types/recommendation'
import { SimulateResponse } from '@/types/simulator'

export const simulateApi = {
  run: async (payload: RecommendRequest): Promise<SimulateResponse> => {
    const response = await apiClient.post('/api/v1/simulate', payload)
    return response.data
  },

  compare: async (
    before: Record<string, unknown>,
    after: Record<string, unknown>
  ): Promise<{
    before_results: SimulateResponse
    after_results: SimulateResponse
    changes_summary: {
      previous_top_material: string
      new_top_material: string
      score_change: number
      changed: boolean
      summary: string
    }
  }> => {
    const response = await apiClient.post('/api/v1/simulate/compare', {
      before,
      after,
    })
    return response.data
  },
}
