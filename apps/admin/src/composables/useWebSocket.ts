import { ref, onUnmounted } from 'vue'
import { toast } from 'vue-sonner'
import { useAppStore } from '~/stores/app'
import type { WsPing, WsServerMessage } from '@3qrain/shared'

export function useWebSocket() {
  const store = useAppStore()
  const connected = ref(false)
  let ws: WebSocket | null = null
  let pingTimer: ReturnType<typeof setInterval> | null = null
  let pongTimer: ReturnType<typeof setTimeout> | null = null
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null
  const INITIAL_DELAY = 1_000
  const MAX_DELAY = 30_000
  let reconnectDelay = INITIAL_DELAY

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
      reconnectDelay = INITIAL_DELAY
      startHeartbeat()
    }

    ws.onmessage = event => {
      try {
        const msg: WsServerMessage = JSON.parse(event.data)

        if (msg.type === 'pong') {
          if (pongTimer) {
            clearTimeout(pongTimer)
            pongTimer = null
          }
          return
        }

        if (msg.type === 'notification') {
          store.unreadCount++
          toast(msg.data.title, {
            description: msg.data.content || undefined,
            action: msg.data.meta
              ? {
                  label: '查看',
                  onClick: () => {
                    try {
                      const meta = JSON.parse(msg.data.meta!)
                      if (meta.targetType === 'post' && meta.targetId) {
                        // 跳转到文章管理页
                      }
                    } catch {
                      /* ignore */
                    }
                  }
                }
              : undefined,
          })
        }
      } catch {
        /* ignore */
      }
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
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
    if (ws) {
      ws.close(1000)
      ws = null
    }
    connected.value = false
  }

  function scheduleReconnect() {
    if (reconnectTimer) return
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null
      connect()
      reconnectDelay = Math.min(reconnectDelay * 2, MAX_DELAY)
    }, reconnectDelay)
  }

  function startHeartbeat() {
    stopHeartbeat()
    pingTimer = setInterval(() => {
      if (ws?.readyState === WebSocket.OPEN) {
        const ping: WsPing = { type: 'ping' }
        ws.send(JSON.stringify(ping))

        // 等 pong 回复
        if (pongTimer) {
          clearTimeout(pongTimer)
        }
        pongTimer = setTimeout(() => {
          // 超时未回复，断开重连
          ws?.close(4000)
        }, 10_000)
      }
    }, 30_000)
  }

  function stopHeartbeat() {
    if (pingTimer) {
      clearInterval(pingTimer)
      pingTimer = null
    }
    if (pongTimer) {
      clearTimeout(pongTimer)
      pongTimer = null
    }
  }

  onUnmounted(() => {
    disconnect()
  })

  return { connected, connect, disconnect }
}
