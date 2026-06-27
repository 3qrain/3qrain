import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { timestamps } from './columns.helpers'
import { users } from './users'

export const comments = sqliteTable('comments', {
  id: integer().primaryKey({ autoIncrement: true }),
  targetType: text('target_type').notNull(),
  targetId: integer('target_id').notNull(),
  userId: integer('user_id').notNull().references(() => users.id),
  parentId: integer('parent_id'),
  replyToUserId: integer('reply_to_user_id'),
  replyToId: integer('reply_to_id'),
  isPinned: integer('is_pinned', { mode: 'boolean' }).notNull().default(false),
  content: text('content').notNull(),
  status: text('status').notNull().default('pending'),
  ip: text('ip'),
  userAgent: text('user_agent'),
  deletedAt: integer('deleted_at', { mode: 'timestamp_ms' }),
  ...timestamps,
})
