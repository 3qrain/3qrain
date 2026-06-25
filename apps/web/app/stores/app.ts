export const useAppStore = defineStore('web-app', () => {
  const visitorId = ref('')

  function genVisitorId() {
    if (!visitorId.value) {
      visitorId.value = crypto.randomUUID()
    }
    return visitorId.value
  }

  return { visitorId, genVisitorId }
}, { persist: { key: '3qrain:web-app', pick: ['visitorId'] } })
