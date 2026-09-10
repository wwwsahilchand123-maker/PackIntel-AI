export type MaterialCategory = 'plastic' | 'glass' | 'metal' | 'bio' | 'paper' | 'composite'
export type CostTier = 'low' | 'medium' | 'high' | 'premium'

export interface MaterialDetail {
  id: string
  name: string
  abbreviation?: string
  category: MaterialCategory
  moisture_barrier: number
  oxygen_barrier: number
  temp_min_c: number
  temp_max_c: number
  shelf_life_days: number
  eco_score: number
  recyclable: boolean
  compostable: boolean
  food_safe: boolean
  cost_tier: CostTier
  description?: string
  key_properties?: string[]
}
