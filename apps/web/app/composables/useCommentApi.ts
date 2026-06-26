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
  replyToUserId: number | null
  replyToUser: CommentUser | null
  content: string
  isPinned: boolean
  createdAt: string
}

export function useCommentApi() {
  const { $api } = useNuxtApp()

  function getList(targetType: string, targetId: number, page = 1) {
    return $api<ApiResponse<PaginatedData<CommentItem>>>('/comments', {
      query: { targetType, targetId, page, pageSize: 20 },
    })
  }

  function create(body: { targetType: string; targetId: number; content: string; parentId?: number; replyToUserId?: number }) {
    return $api<ApiResponse<CommentItem>>('/comments', { method: 'POST', body })
  }

  return { getList, create }
}
