import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { timestamps } from './columns.helpers'

export const notes = sqliteTable('notes', {
  id: integer().primaryKey({ autoIncrement: true }),
  content: text().notNull(),
  isPublished: integer('is_published', { mode: 'boolean' }).notNull().default(true),
  ...timestamps,
})
