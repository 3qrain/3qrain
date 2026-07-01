import type { WsServerMessage } from '@3qrain/shared'

export function useWebSocket() {
  if (import.meta.server) return

  const store = useAppStore()

  onMounted(() => {
    const visitorId = store.genVisitorId()
    const serverPort = useRuntimeConfig().public.serverPort
    const url = `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.hostname}:${serverPort}/api/ws?visitorId=${visitorId}`
    const ws = new WebSocket(url)

    ws.onopen = () => console.log('[ws] connected')
    ws.onclose = () => console.log('[ws] disconnected')
    ws.onmessage = (e) => {
      try {
        const msg: WsServerMessage = JSON.parse(e.data)
        if (msg.type === 'notification') {
          console.log('[ws] notification:', msg.data)
        }
      } catch { /* ignore */ }
    }

    onUnmounted(() => {
      ws.close()
    })
  })
}
