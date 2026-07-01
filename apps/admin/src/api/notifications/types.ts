export interface NotificationItem {
  id: number
  type: string
  title: string
  content: string | null
  meta: string | null
  isRead: number
  createdAt: string
  updatedAt: string | null
}

export interface NotificationListResult {
  list: NotificationItem[]
  total: number
  page: number
  pageSize: number
}

export interface NotificationListQuery {
  page?: number
  pageSize?: number
  offset?: string
  types?: string
  isRead?: string
}
