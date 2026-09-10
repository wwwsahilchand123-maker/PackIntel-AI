import { MaterialDetail } from './materials'

export type FoodCategory =
  | 'fresh_produce'
  | 'dairy'
  | 'bakery'
  | 'meat'
  | 'frozen'
  | 'dry_goods'
  | 'beverages'
  | 'processed'
  | 'other'

export type SustainabilityPreference = 'none' | 'low' | 'medium' | 'high'

export interface RecommendRequest {
  food_commodity: string
  food_category?: FoodCategory
  moisture_sensitivity: number
  oxygen_sensitivity: number
  temperature_min: number
  temperature_max: number
  humidity_min?: number
  humidity_max?: number
  shelf_life_days: number
  sustainability_preference: SustainabilityPreference
  special_requirements?: string
  demo_mode?: boolean
}

export interface ScoreBreakdown {
  moisture_score: number
  oxygen_score: number
  temperature_score: number
  shelf_life_score: number
  sustainability_score: number
  rag_relevance_score: number
  penalties_applied: string[]
  final_score: number
  weights_used: Record<string, number>
}

export interface ExplanationBlock {
  type: 'primary' | 'detail' | 'caveat' | 'regulation'
  heading: string
  content: string
  confidence: number
}

export interface EvidenceChunk {
  chunk_id: string
  source: string
  content: string
  relevance_score: number
  material_referenced?: string
}

export interface RankedMaterial {
  rank: number
  material: MaterialDetail
  compatibility_score: number
  score_label: string
  score_breakdown: ScoreBreakdown
}

export interface RecommendationResult {
  material: MaterialDetail
  compatibility_score: number
  score_label: string
  score_breakdown: ScoreBreakdown
  explanation: ExplanationBlock[]
  evidence: EvidenceChunk[]
  confidence: number
}

export interface RecommendResponse {
  session_id: string
  query_id: string
  food_commodity: string
  recommendation: RecommendationResult
  alternatives: RankedMaterial[]
  all_materials_ranked: RankedMaterial[]
  processing_time_ms: number
  mode: string
}
