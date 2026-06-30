import { apiClient } from '~/lib/axios'
import type { NotificationItem, NotificationListResult } from './types'

export async function getNotifications(params?: { page?: number; pageSize?: number }) {
  const { data } = await apiClient.get<{ data: NotificationListResult }>('/admin/notifications', { params })
  return data.data
}

export async function getUnreadCount() {
  const { data } = await apiClient.get<{ data: { count: number } }>('/admin/notifications/unread-count')
  return data.data.count
}

export async function markRead(id: number) {
  const { data } = await apiClient.patch<{ data: NotificationItem }>(`/admin/notifications/${id}/read`)
  return data.data
}

export async function markAllRead() {
  const { data } = await apiClient.patch('/admin/notifications/read-all')
  return data
}

export async function deleteNotification(id: number) {
  const { data } = await apiClient.delete(`/admin/notifications/${id}`)
  return data
}

export async function clearRead() {
  const { data } = await apiClient.delete('/admin/notifications')
  return data
}
