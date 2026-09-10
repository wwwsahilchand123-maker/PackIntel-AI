import { create } from 'zustand'
import { RecommendRequest } from '@/types/recommendation'
import { SimulateResponse } from '@/types/simulator'

interface SimulatorState {
  beforeConditions: Partial<RecommendRequest>
  afterConditions: Partial<RecommendRequest>
  beforeResult: SimulateResponse | null
  afterResult: SimulateResponse | null
  changesSummary: {
    previous_top_material: string
    new_top_material: string
    score_change: number
    changed: boolean
    summary: string
  } | null
  loading: boolean
  error: string | null

  setBeforeConditions: (c: Partial<RecommendRequest>) => void
  setAfterConditions: (c: Partial<RecommendRequest>) => void
  setResults: (
    before: SimulateResponse,
    after: SimulateResponse,
    summary: SimulatorState['changesSummary']
  ) => void
  setLoading: (v: boolean) => void
  setError: (e: string | null) => void
  reset: () => void
}

const defaultConditions: Partial<RecommendRequest> = {
  food_commodity: 'Fresh Tomatoes',
  moisture_sensitivity: 7,
  oxygen_sensitivity: 6,
  temperature_min: 2,
  temperature_max: 8,
  shelf_life_days: 14,
  sustainability_preference: 'none',
}

export const useSimulatorStore = create<SimulatorState>((set) => ({
  beforeConditions: defaultConditions,
  afterConditions: defaultConditions,
  beforeResult: null,
  afterResult: null,
  changesSummary: null,
  loading: false,
  error: null,

  setBeforeConditions: (c) =>
    set((s) => ({ beforeConditions: { ...s.beforeConditions, ...c } })),
  setAfterConditions: (c) =>
    set((s) => ({ afterConditions: { ...s.afterConditions, ...c } })),
  setResults: (before, after, summary) =>
    set({ beforeResult: before, afterResult: after, changesSummary: summary }),
  setLoading: (v) => set({ loading: v }),
  setError: (e) => set({ error: e }),
  reset: () =>
    set({
      beforeResult: null,
      afterResult: null,
      changesSummary: null,
      error: null,
    }),
}))
