import { apiClient } from '~/lib/axios'
import type { ChangePasswordPayload, AdminProfile, AdminSession } from './types'

export async function getProfile() {
  const { data } = await apiClient.get<{ data: AdminProfile }>('/admin/profile')
  return data.data
}

export async function updateProfile(body: Partial<Omit<AdminProfile, 'id'>>) {
  const { data } = await apiClient.patch<{ data: AdminProfile }>('/admin/profile', body)
  return data.data
}

export async function getSessions() {
  const { data } = await apiClient.get<{ data: AdminSession[] }>('/admin/sessions')
  return data.data
}

export async function kickSession(token: string) {
  const { data } = await apiClient.delete(`/admin/sessions/${token}`)
  return data
}

export async function kickAllSessions() {
  const { data } = await apiClient.delete('/admin/sessions')
  return data
}

export async function changePassword(payload: ChangePasswordPayload) {
  const { data } = await apiClient.post('/admin/change-password', payload)
  return data
}

export async function logout() {
  const { data } = await apiClient.post('/admin/logout')
  return data
}
