import { defineStore } from 'pinia'

type PaginationMode = 'button' | 'scroll'

interface NoteComposeDraft {
  content: string
  tagIds: number[]
  isPublished: boolean
  images: { mediaId: number; preview: string }[]
}

interface AdminUser {
  id: number
  username: string
  email: string
  avatarUrl: string
}

interface AppState {
  theme: 'system' | 'light' | 'dark'
  postsPaginationMode: PaginationMode
  notesPaginationMode: PaginationMode
  mediaPaginationMode: PaginationMode
  noteComposeDraft: NoteComposeDraft | null
  adminUser: AdminUser | null
}

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    theme: 'system',
    postsPaginationMode: 'scroll',
    notesPaginationMode: 'scroll',
    mediaPaginationMode: 'scroll',
    noteComposeDraft: null,
    adminUser: null,
  }),
  persist: { key: '3qrain:admin-app' },
})
