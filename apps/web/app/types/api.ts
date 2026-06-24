export interface ApiResponse<T> {
  success: boolean
  code: string
  message: string
  timestamp: number
  data: T
}

export interface PaginatedData<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

export interface PostItem {
  id: number
  title: string
  slug: string
  summary: string | null
  cover: string | null
  isPinned: boolean
  viewCount: number
  categoryId: number | null
  category: { id: number; name: string; slug: string } | null
  tags: { id: number; name: string; slug: string }[]
  createdAt: string
}

export interface PostDetail extends PostItem {
  contentHtml: string | null
  updatedAt: string
}

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
