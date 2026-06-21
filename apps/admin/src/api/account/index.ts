import { apiClient } from '~/lib/axios'
import type { ChangePasswordPayload, AdminProfile } from './types'

export async function getProfile() {
  const { data } = await apiClient.get<{ data: AdminProfile }>('/admin/profile')
  return data.data
}

export async function updateProfile(body: Partial<Omit<AdminProfile, 'id'>>) {
  const { data } = await apiClient.patch<{ data: AdminProfile }>('/admin/profile', body)
  return data.data
}

export async function changePassword(payload: ChangePasswordPayload) {
  const { data } = await apiClient.post('/admin/change-password', payload)
  return data
}
