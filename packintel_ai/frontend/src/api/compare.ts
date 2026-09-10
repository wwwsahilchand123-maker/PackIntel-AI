import apiClient from './client'

export interface CompareRequest {
  material_ids: string[]
  food_commodity?: string
  demo_mode?: boolean
}

export interface RadarDataPoint {
  property: string
  values: Record<string, number>
  raw_values: Record<string, number>
  unit: string
}

export type RadarChartData = RadarDataPoint

export interface CompareResponse {
  comparison_id: string
  materials: import('@/types/materials').MaterialDetail[]
  comparison_matrix: {
    properties: string[]
    data: Record<string, Record<string, number>>
  }
  radar_data: RadarDataPoint[]
  winner_by_property: Record<string, string>
  overall_ranking: Array<{
    rank: number
    material_name: string
    overall_score: number
  }>
}

export const compareApi = {
  compare: async (payload: CompareRequest): Promise<CompareResponse> => {
    const response = await apiClient.post('/api/v1/compare', payload)
    return response.data
  },
}
