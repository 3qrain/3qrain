import type { Context } from 'hono'
import { and, desc, count, eq, inArray, isNull } from 'drizzle-orm'
import { db } from '~/db'
import { notes, noteTags, noteMedia, tags, media } from '~/db/schema'
import { ok } from '~/utils/response'
import * as HttpStatusCodes from '~/constants/http-status-codes'

function toUrl(p: string | null) {
  return p ? `/storage${p}` : null
}

export async function list(c: Context) {
  const page = Number(c.req.query('page') || 1)
  const pageSize = Number(c.req.query('pageSize') || 20)

  const filter = and(eq(notes.isPublished, true), isNull(notes.deletedAt))

  const total = db.select({ count: count() }).from(notes).where(filter).get()!.count
  const rows = db.select().from(notes)
    .where(filter)
    .orderBy(desc(notes.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize)
    .all()

  if (rows.length === 0) {
    return c.json(ok({ list: [], total, page, pageSize }, '获取成功'), HttpStatusCodes.OK)
  }

  const noteIds = rows.map(r => r.id)

  const tagRows = db.select({
    noteId: noteTags.noteId,
    id: tags.id,
    name: tags.name,
    slug: tags.slug,
  }).from(noteTags)
    .innerJoin(tags, eq(noteTags.tagId, tags.id))
    .where(inArray(noteTags.noteId, noteIds))
    .all()

  const mediaRows = db.select({
    noteId: noteMedia.noteId,
    sort: noteMedia.sort,
    id: media.id,
    originalPath: media.originalPath,
    thumbnailPath: media.thumbnailPath,
    placeholder: media.placeholder,
    mimeType: media.mimeType,
    type: media.type,
    width: media.width,
    height: media.height,
  }).from(noteMedia)
    .innerJoin(media, eq(noteMedia.mediaId, media.id))
    .where(inArray(noteMedia.noteId, noteIds))
    .orderBy(noteMedia.sort)
    .all()

  const list = rows.map(note => ({
    id: note.id,
    content: note.content,
    createdAt: note.createdAt,
    tags: tagRows.filter(t => t.noteId === note.id).map(({ noteId, ...tag }) => tag),
    media: mediaRows.filter(m => m.noteId === note.id).map(({ noteId, ...m }) => ({
      id: m.id,
      url: toUrl(m.originalPath),
      thumbnailUrl: toUrl(m.thumbnailPath),
      placeholder: m.placeholder,
      type: m.type,
      mimeType: m.mimeType,
      width: m.width,
      height: m.height,
      sort: m.sort,
    })),
  }))

  return c.json(ok({ list, total, page, pageSize }, '获取成功'), HttpStatusCodes.OK)
}
