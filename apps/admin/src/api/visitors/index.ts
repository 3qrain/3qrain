import { apiClient } from '~/lib/axios'
import type { Visitor } from './types'

export async function getVisitors() {
  const { data } = await apiClient.get<{ data: Visitor[] }>('/admin/visitors')
  return data.data
}

export async function updateVisitor(id: number, body: { isAdmin?: boolean; isBanned?: boolean }) {
  const { data } = await apiClient.patch<{ data: Visitor }>(`/admin/visitors/${id}`, body)
  return data.data
}
