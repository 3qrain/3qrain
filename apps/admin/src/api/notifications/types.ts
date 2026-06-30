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
