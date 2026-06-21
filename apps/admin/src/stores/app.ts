import { defineStore } from 'pinia'

type PaginationMode = 'button' | 'scroll'

interface AppState {
  theme: 'system' | 'light' | 'dark'
  postsPaginationMode: PaginationMode
  notesPaginationMode: PaginationMode
  mediaPaginationMode: PaginationMode
}

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    theme: 'system',
    postsPaginationMode: 'scroll',
    notesPaginationMode: 'scroll',
    mediaPaginationMode: 'scroll',
  }),
  persist: true,
})
