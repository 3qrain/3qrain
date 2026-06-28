import { ref } from 'vue'

export function useOAuth() {
  const store = useAppStore()
  const userApi = useUserApi()
  const loadingProvider = ref('')

  async function onSuccess() {
    try {
      const res = await userApi.me()
      store.user = res.data ?? null
    } catch { store.user = null }
    finally { loadingProvider.value = '' }
  }

  function login(provider: string) {
    loadingProvider.value = provider
    const left = window.screenX + (window.outerWidth - 600) / 2
    const top = window.screenY + (window.outerHeight - 700) / 2
    const win = window.open(
      `/api/auth/${provider}`,
      'oauth',
      `width=600,height=700,left=${left},top=${top}`,
    )

    const checkClosed = setInterval(() => {
      if (win?.closed) {
        clearInterval(checkClosed)
        loadingProvider.value = ''
      }
    }, 500)

    window.addEventListener('message', (e) => {
      if (e.origin !== location.origin) return
      if (e.data?.type === 'oauth-success') {
        clearInterval(checkClosed)
        win?.close()
        onSuccess()
      }
    }, { once: true })
  }

  return { loadingProvider, login }
}
