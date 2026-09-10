import { RecommendRequest, RankedMaterial, RecommendResponse } from './recommendation'

export interface SimulateRequest {
  base_query_id?: string
  food_commodity: string
  conditions: RecommendRequest
  demo_mode?: boolean
}

export interface DeltaResult {
  previous_top_material: string
  new_top_material: string
  score_change: number
  changed: boolean
  summary: string
}

export interface SimulateResponse extends RecommendResponse {
  simulation_id?: string
  results?: RankedMaterial[]
  delta_from_base?: DeltaResult
}
