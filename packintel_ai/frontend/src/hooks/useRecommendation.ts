import { useCallback } from 'react'
import { recommendApi } from '@/api/recommend'
import { useRecommendStore } from '@/store/recommendStore'
import { useAppStore } from '@/store/appStore'
import { RecommendRequest } from '@/types/recommendation'

export function useRecommendation() {
  const { demoMode } = useAppStore()
  const { loading, error, response, setLoading, setError, setResponse } =
    useRecommendStore()

  const analyze = useCallback(
    async (request: RecommendRequest) => {
      setLoading(true)
      setError(null)
      setResponse(null)

      try {
        const result = await recommendApi.create({
          ...request,
          demo_mode: demoMode,
        })
        setResponse(result)
        return result
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Analysis failed. Please try again.'
        setError(message)
        return null
      } finally {
        setLoading(false)
      }
    },
    [demoMode, setLoading, setError, setResponse]
  )

  return { analyze, loading, error, response }
}
