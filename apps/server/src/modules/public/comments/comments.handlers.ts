import type { Context } from 'hono'
import { and, eq, asc, desc, isNull, count, inArray } from 'drizzle-orm'
import { db, redis } from '~/db'
import { comments, users } from '~/db/schema'
import { ok, fail } from '~/utils/response'
import { ErrorCode } from '@3qrain/shared'
import * as HttpStatusCodes from '~/constants/http-status-codes'
import { SESSION_USER_PREFIX, userSessionValueSchema } from '~/constants/session'
import { createCommentSchema } from './comments.routes'

async function resolveUserSession(c: Context) {
  const cookie = c.req.header('cookie') || ''
  const match = cookie.match(/3qrain_user_token=([^;]+)/)
  if (!match) return null

  const raw = await redis.get(`${SESSION_USER_PREFIX}${match[1]}`)
  if (!raw) return null

  const parsed = userSessionValueSchema.safeParse(JSON.parse(raw))
  if (!parsed.success) return null

  const user = db.select().from(users).where(eq(users.id, parsed.data.userId)).get()
  return user || null
}

function enrichComments(rows: any[]) {
  if (rows.length === 0) return []
  const userIds = [...new Set(
    rows.flatMap(r => [r.userId, r.replyToUserId].filter(Boolean))
  )] as number[]

  const userMap = new Map(
    db.select({ id: users.id, username: users.username, avatarUrl: users.avatarUrl })
      .from(users).where(inArray(users.id, userIds)).all().map(u => [u.id, u]),
  )

  return rows.map(c => ({
    id: c.id,
    targetType: c.targetType,
    targetId: c.targetId,
    userId: c.userId,
    user: userMap.get(c.userId) || { id: c.userId, username: '', avatarUrl: '' },
    parentId: c.parentId,
    replyToUserId: c.replyToUserId,
    replyToUser: c.replyToUserId ? (userMap.get(c.replyToUserId) || null) : null,
    content: c.content,
    isPinned: c.isPinned,
    createdAt: c.createdAt,
  }))
}

export async function list(c: Context) {
  const { targetType, targetId } = c.req.query()
  const page = Number(c.req.query('page') || 1)
  const pageSize = Number(c.req.query('pageSize') || 20)

  const filter = and(
    eq(comments.targetType, targetType),
    eq(comments.targetId, Number(targetId)),
    eq(comments.status, 'published'),
    isNull(comments.deletedAt),
  )

  const total = db.select({ count: count() }).from(comments).where(filter).get()!.count

  const rows = db
    .select()
    .from(comments)
    .where(filter)
    .orderBy(desc(comments.isPinned), asc(comments.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize)
    .all()

  const list = enrichComments(rows)
  return c.json(ok({ list, total, page, pageSize }, '获取成功'), HttpStatusCodes.OK)
}

export async function create(c: Context) {
  const user = await resolveUserSession(c)
  if (!user) {
    return c.json(fail(ErrorCode.UNAUTHORIZED, '请先登录'), HttpStatusCodes.UNAUTHORIZED)
  }

  const parsed = createCommentSchema.safeParse(await c.req.json())
  if (!parsed.success) {
    return c.json(fail(ErrorCode.INVALID_PARAMS, parsed.error.issues[0].message), HttpStatusCodes.BAD_REQUEST)
  }

  const body = parsed.data
  const result = db
    .insert(comments)
    .values({
      targetType: body.targetType,
      targetId: body.targetId,
      userId: user.id,
      parentId: body.parentId || null,
      replyToUserId: body.replyToUserId || null,
      content: body.content,
      status: 'published',
      ip: c.req.header('x-forwarded-for') || null,
      userAgent: c.req.header('user-agent') || null,
    })
    .returning()
    .get()

  const [enriched] = enrichComments([result])
  return c.json(ok(enriched, '评论成功'), HttpStatusCodes.CREATED)
}
