import { useState, useEffect } from 'react'
import { materialsApi, FoodProfile, FoodCategory } from '@/api/materials'
import { MaterialDetail } from '@/types/materials'

export function useMaterials() {
  const [materials, setMaterials] = useState<MaterialDetail[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMaterials = async (params?: {
    category?: string
    sort_by?: string
    order?: string
  }) => {
    setLoading(true)
    setError(null)
    try {
      const data = await materialsApi.list(params)
      setMaterials(data.materials)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load materials')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMaterials()
  }, [])

  return { materials, loading, error, fetchMaterials }
}

export function useFoodProfiles() {
  const [profiles, setProfiles] = useState<FoodProfile[]>([])
  const [categories, setCategories] = useState<FoodCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = async (query?: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await materialsApi.getFoodProfiles(query)
      setProfiles(data.profiles)
      setCategories(data.categories)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load food profiles')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    search()
  }, [])

  return { profiles, categories, loading, error, search }
}
