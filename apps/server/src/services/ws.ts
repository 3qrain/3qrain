import type { Context } from 'hono'
import type { WSContext } from 'hono/ws'
import Redis from 'ioredis'

/* ------------------------------------------------------------------ */
/* 连接管理                                                            */
/* ------------------------------------------------------------------ */

type ConnInfo =
  | { role: 'admin' }
  | { role: 'visitor'; visitorId: string }

const connections = new Map<unknown, ConnInfo>()

function countByRole(role: ConnInfo['role']): number {
  let n = 0
  for (const info of connections.values()) {
    if (info.role === role) n++
  }
  return n
}

export function getVisitorCount(): number {
  const ids = new Set<string>()
  for (const info of connections.values()) {
    if (info.role === 'visitor') ids.add(info.visitorId)
  }
  return ids.size
}

/* ------------------------------------------------------------------ */
/* Redis 订阅                                                           */
/* ------------------------------------------------------------------ */

const CHANNEL = '3qrain:ws:events'
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'
const subscriber = new Redis(REDIS_URL, { lazyConnect: true })

async function startSubscriber() {
  try {
    await subscriber.connect()
    await subscriber.subscribe(CHANNEL)
    console.log('[ws] subscribed to', CHANNEL)
  } catch (err) {
    console.error('[ws] redis subscribe error:', err)
    setTimeout(startSubscriber, 5000)
  }
}

subscriber.on('message', (channel, message) => {
  if (channel !== CHANNEL || connections.size === 0) return

  try {
    const { scope, payload } = JSON.parse(message)

    for (const [raw, info] of connections) {
      if (scope === 'admin' && info.role !== 'admin') continue
      if (scope === 'public' && info.role !== 'visitor') continue

      try { (raw as any).send(JSON.stringify(payload)) } catch { /* ignore */ }
    }
  } catch { /* ignore malformed */ }
})

subscriber.on('error', (err) => {
  console.error('[ws] subscriber error:', err.message)
})

subscriber.on('close', () => {
  console.log('[ws] subscriber connection closed, reconnecting...')
  setTimeout(startSubscriber, 3000)
})

startSubscriber()

/* ------------------------------------------------------------------ */
/* WS handler                                                           */
/* ------------------------------------------------------------------ */

function makeHandler(role: ConnInfo['role']) {
  return (c: Context) => {
    const visitorId = c.req.query('visitorId') || ''

    return {
      onOpen(_evt: Event, ws: WSContext) {
        if (role === 'visitor' && !visitorId) {
          ws.close(4001, 'Missing visitorId')
          return
        }

        const info: ConnInfo = role === 'visitor'
          ? { role: 'visitor', visitorId }
          : { role: 'admin' }

        connections.set(ws.raw, info)

        console.log(`[ws] ${role} connected (size=${connections.size}, admin=${countByRole('admin')}, visitor=${getVisitorCount()})`)
      },

      onClose(_evt: Event, ws: WSContext) {
        const existed = connections.has(ws.raw)
        if (existed) connections.delete(ws.raw)
        console.log(`[ws] ${role} disconnected (existed=${existed}, size=${connections.size}, admin=${countByRole('admin')})`)
      },

      onMessage(evt: MessageEvent, ws: WSContext) {
        try {
          const msg = JSON.parse(evt.data as string)
          if (msg.type === 'ping') {
            ws.send(JSON.stringify({ type: 'pong' }))
          }
        } catch { /* ignore malformed */ }
      },
    }
  }
}

export const adminWsHandler = makeHandler('admin')
export const publicWsHandler = makeHandler('visitor')
