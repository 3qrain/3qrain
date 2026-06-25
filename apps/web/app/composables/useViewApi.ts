import type { ApiResponse } from '~/types/api'

export function useViewApi() {
  const { $api } = useNuxtApp()

  function record(contentId: number, contentType: 'post', visitorId: string) {
    return $api<ApiResponse<{ viewCount: number }>>('/view', {
      method: 'POST',
      body: { contentId, contentType, visitorId },
    })
  }

  function getCount(contentType: 'post', contentId: number) {
    return $api<ApiResponse<{ viewCount: number }>>('/view/count', {
      query: { contentType, contentId },
    })
  }

  return { record, getCount }
}
