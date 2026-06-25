import type { ApiResponse } from '~/types/api'

export interface UserInfo {
  id: number
  username: string
  email: string
  avatarUrl: string
  role: string
}

export function useUserApi() {
  const { $api } = useNuxtApp()

  function me() {
    const headers = import.meta.server ? useRequestHeaders(['cookie']) as Record<string, string> : {}
    return $api<ApiResponse<UserInfo | null>>('/user/me', { headers })
  }

  function updateMe(body: { username?: string; email?: string }) {
    return $api<ApiResponse<UserInfo>>('/user/me', {
      method: 'PATCH',
      body,
    })
  }

  function logout() {
    return $api<ApiResponse<{}>>('/user/logout', { method: 'POST' })
  }

  return { me, updateMe, logout }
}
