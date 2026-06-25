import type { ApiResponse, PaginatedData, NoteItem } from '~/types/api'

export function useNoteApi() {
  const { $api } = useNuxtApp()

  function getList(query: { page?: number; pageSize?: number }) {
    return $api<ApiResponse<PaginatedData<NoteItem>>>('/notes', { query })
  }

  return { getList }
}
