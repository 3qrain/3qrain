import type { ApiResponse, PaginatedData, PostItem, PostDetail } from '~/types/api'

export function usePostApi() {
  const { $api } = useNuxtApp()

  function getList(query: { page?: number; pageSize?: number; category?: string; tag?: string }) {
    return $api<ApiResponse<PaginatedData<PostItem>>>('/posts', { query })
  }

  function getDetail(slug: string) {
    return $api<ApiResponse<PostDetail>>(`/posts/${slug}`)
  }

  return { getList, getDetail }
}
