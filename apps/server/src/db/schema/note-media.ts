import { sqliteTable, integer, primaryKey } from 'drizzle-orm/sqlite-core'
import { notes } from './notes'
import { media } from './media'

export const noteMedia = sqliteTable(
  'note_media',
  {
    noteId: integer('note_id').notNull().references(() => notes.id, { onDelete: 'cascade' }),
    mediaId: integer('media_id').notNull().references(() => media.id, { onDelete: 'cascade' }),
    sort: integer().notNull().default(0),
  },
  (table) => [
    primaryKey({ columns: [table.noteId, table.mediaId] }),
  ],
)
