import type { ApiResponse, PaginatedData } from '~/types/api'

export interface CommentUser {
  id: number
  username: string
  avatarUrl: string
}

export interface CommentItem {
  id: number
  targetType: string
  targetId: number
  userId: number
  user: CommentUser
  parentId: number | null
  replyToId: number | null
  replyToUserId: number | null
  replyToUser: CommentUser | null
  content: string
  isPinned: boolean
  createdAt: string
}

export function useCommentApi() {
  const { $api } = useNuxtApp()

  function getList(targetType: string, targetId: number, pageSize = 10, cursor?: string) {
    const query: Record<string, any> = { targetType, targetId, pageSize }
    if (cursor) query.cursor = cursor
    return $api<ApiResponse<{ list: CommentItem[]; total: number; pageSize: number }>>('/comments', { query })
  }

  function create(body: { targetType: string; targetId: number; content: string; parentId?: number; replyToId?: number; replyToUserId?: number }) {
    return $api<ApiResponse<CommentItem>>('/comments', { method: 'POST', body })
  }

  return { getList, create }
}
