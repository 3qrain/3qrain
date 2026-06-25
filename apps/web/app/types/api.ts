export interface ApiResponse<T> {
  success: boolean
  code: string
  message: string
  timestamp: number
  data: T
}

export interface PaginatedData<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}
