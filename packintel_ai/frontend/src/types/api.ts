export interface ApiError {
  detail: string
  status_code?: number
}

export interface ApiResponse<T> {
  data: T
  status: number
}

export type AppMode = 'demo' | 'full'
