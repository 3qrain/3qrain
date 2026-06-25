export function useUserApi() {
  const { $api } = useNuxtApp()

  function me() {
    return $api<{ success: boolean; data: any }>('/user/me')
  }

  function updateMe(body: { username?: string; email?: string }) {
    return $api<{ success: boolean; data: any }>('/user/me', {
      method: 'PATCH',
      body,
    })
  }

  function logout() {
    return $api<{}>('/user/logout', { method: 'POST' })
  }

  return { me, updateMe, logout }
}
