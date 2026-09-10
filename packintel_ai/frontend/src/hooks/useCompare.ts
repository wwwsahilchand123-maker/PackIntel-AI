import { useState, useCallback } from 'react'
import { compareApi, CompareResponse } from '@/api/compare'
import { useAppStore } from '@/store/appStore'

export function useCompare() {
  const { demoMode } = useAppStore()
  const [response, setResponse] = useState<CompareResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const compare = useCallback(
    async (materialIds: string[], foodCommodity?: string) => {
      if (materialIds.length < 2) {
        setError('Select at least 2 materials to compare.')
        return null
      }
      setLoading(true)
      setError(null)
      try {
        const result = await compareApi.compare({
          material_ids: materialIds,
          food_commodity: foodCommodity,
          demo_mode: demoMode,
        })
        setResponse(result)
        return result
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Comparison failed.')
        return null
      } finally {
        setLoading(false)
      }
    },
    [demoMode]
  )

  return { compare, response, loading, error }
}
