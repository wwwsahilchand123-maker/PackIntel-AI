import { useCallback } from 'react'
import { simulateApi } from '@/api/simulate'
import { useSimulatorStore } from '@/store/simulatorStore'
import { useAppStore } from '@/store/appStore'
import { RecommendRequest } from '@/types/recommendation'

export function useSimulator() {
  const { demoMode } = useAppStore()
  const {
    beforeConditions,
    afterConditions,
    beforeResult,
    afterResult,
    changesSummary,
    loading,
    error,
    setBeforeConditions,
    setAfterConditions,
    setResults,
    setLoading,
    setError,
  } = useSimulatorStore()

  const runComparison = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const before = { ...beforeConditions, demo_mode: demoMode } as Record<string, unknown>
      const after = { ...afterConditions, demo_mode: demoMode } as Record<string, unknown>

      const result = await simulateApi.compare(before, after)
      setResults(
        result.before_results,
        result.after_results,
        result.changes_summary
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Simulation failed.')
    } finally {
      setLoading(false)
    }
  }, [beforeConditions, afterConditions, demoMode, setLoading, setError, setResults])

  return {
    beforeConditions,
    afterConditions,
    beforeResult,
    afterResult,
    changesSummary,
    loading,
    error,
    setBeforeConditions,
    setAfterConditions,
    runComparison,
  }
}
