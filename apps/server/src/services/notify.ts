import { db, redis } from '~/db'
import { notifications } from '~/db/schema'

const CHANNEL = '3qrain:ws:events'

interface NotifyInput {
  scope: 'admin' | 'public'
  type: string
  title: string
  content?: string
  meta?: string
}

export async function notify(input: NotifyInput) {
  const record = db.insert(notifications).values(input).returning().get()

  await redis.publish(CHANNEL, JSON.stringify({
    scope: input.scope,
    payload: record,
  }))

  return record
}
