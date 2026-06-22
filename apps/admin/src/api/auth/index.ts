import { apiClient } from '~/lib/axios'
import type { StatusResult, SetupResult, SetupPayload } from './types'

export async function checkStatus() {
  const { data } = await apiClient.get<{ data: StatusResult }>('/auth/status')
  return data.data
}

export async function setup(payload: SetupPayload) {
  const { data } = await apiClient.post<{ data: SetupResult }>('/auth/setup', payload)
  return data.data
}

export async function login(password: string) {
  const { data } = await apiClient.post('/auth/login', { password })
  return data
}

export async function recover(recoveryKey: string) {
  const { data } = await apiClient.post('/auth/recover', { recoveryKey })
  return data
}
