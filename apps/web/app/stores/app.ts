type Theme = 'system' | 'light' | 'dark'

export const APP_STORAGE_KEY = '3qrain:web-app'

export const useAppStore = defineStore('app', {
  state: () => ({
    visitorId: '',
    theme: 'system' as Theme,
    site: { name: '3qrain', avatar: '', bio: '' },
    user: null as { id: number; username: string; email: string; avatarUrl: string; role: string } | null,
  }),
  actions: {
    genVisitorId() {
      if (!this.visitorId) {
        this.visitorId = crypto.randomUUID()
      }
      return this.visitorId
    },
  },
  persist: { key: APP_STORAGE_KEY, pick: ['visitorId', 'theme', 'site', 'user'] },
})
