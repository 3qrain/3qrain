export function useWebSocket() {
  if (import.meta.server) return

  const store = useAppStore()

  onMounted(() => {
    const visitorId = store.genVisitorId()
    const serverPort = useRuntimeConfig().public.serverPort
    const url = `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.hostname}:${serverPort}/api/ws?visitorId=${visitorId}`
    const ws = new WebSocket(url)

    ws.onopen = () => console.log('[ws] public connected')
    ws.onclose = () => console.log('[ws] public disconnected')
    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data)
        console.log('[ws] public message:', msg)
      } catch { /* ignore */ }
    }

    onUnmounted(() => {
      ws.close()
    })
  })
}
