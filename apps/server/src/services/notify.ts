import { db, redis } from '~/db'
import { notifications } from '~/db/schema'
import type { WsChannelMessage, NotificationPayload, WsScope } from '@3qrain/shared'
import { CHANNEL } from './ws'

interface NotifyInput {
  scope: WsScope
  type: NotificationPayload['type']
  title: string
  content?: string
  meta?: string
}

export async function notify(input: NotifyInput) {
  const record = db.insert(notifications).values(input).returning().get()

  const payload: NotificationPayload = {
    id: record.id,
    type: input.type,
    title: record.title,
    content: record.content ?? undefined,
    meta: record.meta ?? undefined,
    createdAt: new Date(record.createdAt!).toISOString(),
  }

  const msg: WsChannelMessage = { scope: input.scope, payload }
  await redis.publish(CHANNEL, JSON.stringify(msg))

  return record
}
