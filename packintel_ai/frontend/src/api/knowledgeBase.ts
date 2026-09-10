import apiClient from './client'

export interface DocumentMeta {
  id: string
  filename: string
  original_name?: string
  file_type: string
  file_size_bytes?: number
  status: string
  chunk_count: number
  uploaded_at: string
  indexed_at?: string
  error_message?: string
  description?: string
}

export interface KBSearchResult {
  doc_id: string
  document_name: string
  chunk_text: string
  score: number
}

export interface KBSearchResponse {
  query: string
  results: KBSearchResult[]
  total: number
}

export interface KBStatusResponse {
  total_documents: number
  total_chunks: number
  last_updated: string | null
  qdrant_healthy: boolean
}

export const knowledgeBaseApi = {
  uploadDocument: async (
    file: File,
    description?: string
  ): Promise<{
    document_id: string
    filename: string
    status: string
    message: string
  }> => {
    const formData = new FormData()
    formData.append('file', file)
    if (description) formData.append('description', description)

    const response = await apiClient.post('/api/v1/knowledge-base/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  listDocuments: async (
    status?: string,
    page = 1,
    limit = 20
  ): Promise<{
    documents: DocumentMeta[]
    total: number
  }> => {
    const params = new URLSearchParams()
    if (status) params.append('status', status)
    params.append('page', String(page))
    params.append('limit', String(limit))

    const response = await apiClient.get(`/api/v1/knowledge-base/documents?${params}`)
    return response.data
  },

  deleteDocument: async (docId: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`/api/v1/knowledge-base/documents/${docId}`)
    return response.data
  },

  search: async (query: string, topK = 10): Promise<KBSearchResponse> => {
    const response = await apiClient.post('/api/v1/knowledge-base/search', {
      query,
      top_k: topK,
    })
    return response.data
  },

  getStatus: async (): Promise<KBStatusResponse> => {
    const response = await apiClient.get('/api/v1/knowledge-base/status')
    return response.data
  },
}
