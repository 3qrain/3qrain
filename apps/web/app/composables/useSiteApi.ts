import type { ApiResponse } from '~/types/api'

export interface SiteInfo {
  name: string
  avatar: string
  bio: string
}

export function useSiteApi() {
  const { $api } = useNuxtApp()

  function get() {
    return $api<ApiResponse<SiteInfo>>('/site')
  }

  return { get }
}
