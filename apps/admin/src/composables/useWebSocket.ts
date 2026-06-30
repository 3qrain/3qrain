import { ref, onUnmounted } from 'vue'
import { toast } from 'vue-sonner'
import { useAppStore } from '~/stores/app'

export function useWebSocket() {
  const store = useAppStore()
  const connected = ref(false)
  let ws: WebSocket | null = null
  let pingTimer: ReturnType<typeof setInterval> | null = null
  let pongTimer: ReturnType<typeof setTimeout> | null = null
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null
  let reconnectDelay = 1000

  const WS_URL = `/api/admin/ws`

  function connect() {
    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return

    try {
      ws = new WebSocket(WS_URL)
    } catch {
      scheduleReconnect()
      return
    }

    ws.onopen = () => {
      connected.value = true
      reconnectDelay = 1000
      startHeartbeat()
    }

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)

        // 心跳响应
        if (msg.type === 'pong') {
          if (pongTimer) { clearTimeout(pongTimer); pongTimer = null }
          return
        }

        // 通知消息
        if (msg.type && msg.title) {
          store.unreadCount++
          toast(msg.title, {
            description: msg.content || undefined,
            action: msg.meta
              ? {
                  label: '查看',
                  onClick: () => {
                    try {
                      const meta = JSON.parse(msg.meta!)
                      if (meta.targetType === 'post' && meta.targetId) {
                        // 跳转到文章管理页
                      }
                    } catch { /* ignore */ }
                  },
                }
              : undefined,
          })
        }
      } catch { /* ignore */ }
    }

    ws.onclose = () => {
      connected.value = false
      stopHeartbeat()
      ws = null
      scheduleReconnect()
    }

    ws.onerror = () => {
      // onclose 会在 onerror 之后触发，交给 onclose 处理重连
    }
  }

  function disconnect() {
    stopHeartbeat()
    if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null }
    if (ws) { ws.close(1000); ws = null }
    connected.value = false
  }

  function scheduleReconnect() {
    if (reconnectTimer) return
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null
      connect()
      reconnectDelay = Math.min(reconnectDelay * 2, 30000)
    }, reconnectDelay)
  }

  function startHeartbeat() {
    stopHeartbeat()
    pingTimer = setInterval(() => {
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ping' }))

        // 等 pong 回复
        pongTimer = setTimeout(() => {
          // 超时未回复，断开重连
          if (ws) { ws.close(4000); ws = null }
        }, 10_000)
      }
    }, 30_000)
  }

  function stopHeartbeat() {
    if (pingTimer) { clearInterval(pingTimer); pingTimer = null }
    if (pongTimer) { clearTimeout(pongTimer); pongTimer = null }
  }

  onUnmounted(() => {
    disconnect()
  })

  return { connected, connect, disconnect }
}
