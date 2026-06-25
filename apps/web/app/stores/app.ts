type Theme = 'system' | 'light' | 'dark'

export const useAppStore = defineStore('app', {
  state: () => ({
    visitorId: '',
    theme: 'system' as Theme,
  }),
  actions: {
    genVisitorId() {
      if (!this.visitorId) {
        this.visitorId = crypto.randomUUID()
      }
      return this.visitorId
    },
  },
  persist: { key: '3qrain:web-app', pick: ['visitorId', 'theme'] },
})
