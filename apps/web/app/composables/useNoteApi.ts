import type { ApiResponse, PaginatedData } from '~/types/api'

export interface NoteMedia {
  id: number
  url: string | null
  thumbnailUrl: string | null
  placeholder: string | null
  type: string
  mimeType: string
  width: number | null
  height: number | null
  sort: number
}

export interface NoteItem {
  id: number
  content: string
  createdAt: string
  tags: { id: number; name: string; slug: string }[]
  media: NoteMedia[]
}

export function useNoteApi() {
  const { $api } = useNuxtApp()

  function getList(query: { page?: number; pageSize?: number }) {
    return $api<ApiResponse<PaginatedData<NoteItem>>>('/notes', { query })
  }

  return { getList }
}
