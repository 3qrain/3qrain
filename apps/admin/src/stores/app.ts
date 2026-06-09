import { defineStore } from 'pinia'

interface AppState {
  theme: 'system' | 'light' | 'dark'
}

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    theme: 'system'
  }),
  getters: {},
  actions: {},
  persist: true
})
