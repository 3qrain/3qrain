import type { Context } from 'hono'
import { eq, ne } from 'drizzle-orm'
import { db } from '~/db'
import { users } from '~/db/schema'
import { ok, fail } from '~/utils/response'
import { ErrorCode } from '@3qrain/shared'
import * as HttpStatusCodes from '~/constants/http-status-codes'

function toVisitor(row: typeof users.$inferSelect) {
  const provider = row.githubId ? 'github' : row.googleId ? 'google' : 'system'
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    avatarUrl: row.avatarUrl,
    isAdmin: row.isAdmin,
    isBanned: row.isBanned,
    provider,
    createdAt: row.createdAt,
  }
}

export async function list(c: Context) {
  const rows = db.select().from(users).where(ne(users.id, 1)).all()
  return c.json(ok(rows.map(toVisitor), '获取成功'), HttpStatusCodes.OK)
}

export async function update(c: Context) {
  const id = Number.parseInt(c.req.param('id')!)

  if (id === 1) {
    return c.json(fail(ErrorCode.INVALID_PARAMS, '不能修改系统管理员'), HttpStatusCodes.BAD_REQUEST)
  }

  const existing = db.select().from(users).where(eq(users.id, id)).get()
  if (!existing) {
    return c.json(fail(ErrorCode.INVALID_PARAMS, '用户不存在'), HttpStatusCodes.NOT_FOUND)
  }

  const body = await c.req.json<{ isAdmin?: boolean; isBanned?: boolean }>()
  const result = db.update(users).set(body).where(eq(users.id, id)).returning().get()

  return c.json(ok(toVisitor(result), '更新成功'), HttpStatusCodes.OK)
}
