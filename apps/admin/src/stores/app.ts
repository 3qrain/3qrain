import { defineStore } from 'pinia'

type PaginationMode = 'button' | 'scroll'

interface NoteComposeDraft {
  content: string
  tagIds: number[]
  isPublished: boolean
  images: { mediaId: number; preview: string }[]
}

interface AppState {
  theme: 'system' | 'light' | 'dark'
  postsPaginationMode: PaginationMode
  notesPaginationMode: PaginationMode
  mediaPaginationMode: PaginationMode
  noteComposeDraft: NoteComposeDraft | null
}

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    theme: 'system',
    postsPaginationMode: 'scroll',
    notesPaginationMode: 'scroll',
    mediaPaginationMode: 'scroll',
    noteComposeDraft: null,
  }),
  persist: true,
})
