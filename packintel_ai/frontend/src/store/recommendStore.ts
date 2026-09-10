import { create } from 'zustand'
import { RecommendRequest, RecommendResponse } from '@/types/recommendation'

interface RecommendState {
  request: Partial<RecommendRequest>
  response: RecommendResponse | null
  loading: boolean
  error: string | null

  setRequest: (req: Partial<RecommendRequest>) => void
  setResponse: (res: RecommendResponse | null) => void
  setLoading: (v: boolean) => void
  setError: (e: string | null) => void
  reset: () => void
}

const defaultRequest: Partial<RecommendRequest> = {
  moisture_sensitivity: 5,
  oxygen_sensitivity: 5,
  temperature_min: 2,
  temperature_max: 25,
  humidity_min: 40,
  humidity_max: 80,
  shelf_life_days: 30,
  sustainability_preference: 'none',
}

export const useRecommendStore = create<RecommendState>((set) => ({
  request: defaultRequest,
  response: null,
  loading: false,
  error: null,

  setRequest: (req) =>
    set((s) => ({ request: { ...s.request, ...req } })),
  setResponse: (res) => set({ response: res }),
  setLoading: (v) => set({ loading: v }),
  setError: (e) => set({ error: e }),
  reset: () =>
    set({ request: defaultRequest, response: null, error: null, loading: false }),
}))
