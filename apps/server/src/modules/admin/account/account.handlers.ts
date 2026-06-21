import type { Context } from 'hono'
import { eq } from 'drizzle-orm'
import { db, redis } from '~/db'
import { passwords, users } from '~/db/schema'
import { hashPassword, verifyPassword } from '~/utils/crypto'
import { ok, fail } from '~/utils/response'
import { ErrorCode } from '@3qrain/shared'
import * as HttpStatusCodes from '~/constants/http-status-codes'
import { SESSION_ADMIN_PREFIX } from '~/constants/session'

function getCurrentToken(c: Context) {
  const cookie = c.req.header('cookie') || ''
  const match = cookie.match(/3qrain_token=([^;]+)/)
  return match?.[1] ?? null
}

export async function getProfile(c: Context) {
  const user = db.select().from(users).where(eq(users.role, 'system')).get()
  if (!user) {
    return c.json(fail(ErrorCode.NOT_INITIALIZED, '系统管理员不存在'), HttpStatusCodes.NOT_FOUND)
  }
  return c.json(
    ok({ id: user.id, username: user.username, email: user.email, avatarUrl: user.avatarUrl }, '获取成功'),
    HttpStatusCodes.OK,
  )
}

export async function updateProfile(c: Context) {
  const body = await c.req.json<{ username?: string; email?: string; avatarUrl?: string }>()

  const user = db.select().from(users).where(eq(users.role, 'system')).get()
  if (!user) {
    return c.json(fail(ErrorCode.NOT_INITIALIZED, '系统管理员不存在'), HttpStatusCodes.NOT_FOUND)
  }

  const result = db.update(users).set(body).where(eq(users.id, user.id)).returning().get()
  return c.json(
    ok({ id: result.id, username: result.username, email: result.email, avatarUrl: result.avatarUrl }, '更新成功'),
    HttpStatusCodes.OK,
  )
}

export async function listSessions(c: Context) {
  const currentToken = getCurrentToken(c)
  const keys = await redis.keys(`${SESSION_ADMIN_PREFIX}*`)
  if (keys.length === 0) {
    return c.json(ok([], '获取成功'), HttpStatusCodes.OK)
  }

  const values = await redis.mget(keys)
  const sessions = keys.map((key, i) => {
    const token = key.replace(SESSION_ADMIN_PREFIX, '')
    const data = values[i] ? JSON.parse(values[i]!) : {}
    return {
      token,
      loginIp: data.loginIp ?? '',
      userAgent: data.userAgent ?? '',
      createdAt: data.createdAt ?? 0,
      lastActiveAt: data.lastActiveAt ?? 0,
      isCurrent: token === currentToken,
    }
  }).sort((a, b) => b.lastActiveAt - a.lastActiveAt)

  return c.json(ok(sessions, '获取成功'), HttpStatusCodes.OK)
}

export async function kickSession(c: Context) {
  const token = c.req.param('token')!
  const currentToken = getCurrentToken(c)

  if (token === currentToken) {
    return c.json(fail(ErrorCode.INVALID_PARAMS, '不能踢掉当前会话'), HttpStatusCodes.BAD_REQUEST)
  }

  await redis.del(`${SESSION_ADMIN_PREFIX}${token}`)
  return c.json(ok({}, '已踢出'), HttpStatusCodes.OK)
}

export async function kickAllSessions(c: Context) {
  const currentToken = getCurrentToken(c)
  const keys = await redis.keys(`${SESSION_ADMIN_PREFIX}*`)
  const toDelete = keys.filter(key => key.replace(SESSION_ADMIN_PREFIX, '') !== currentToken)

  if (toDelete.length > 0) {
    await redis.del(toDelete)
  }

  return c.json(ok({}, `已踢出 ${toDelete.length} 个会话`), HttpStatusCodes.OK)
}

export async function changePassword(c: Context) {
  const { oldPassword, newPassword } = await c.req.json<{
    oldPassword: string
    newPassword: string
  }>()

  const pw = db.select().from(passwords).limit(1).all()[0]
  if (!pw) {
    return c.json(fail(ErrorCode.NOT_INITIALIZED, '尚未初始化'), HttpStatusCodes.BAD_REQUEST)
  }

  const valid = await verifyPassword(oldPassword, pw.hash)
  if (!valid) {
    return c.json(fail(ErrorCode.INVALID_PASSWORD, '旧密码错误'), HttpStatusCodes.BAD_REQUEST)
  }

  const newHash = await hashPassword(newPassword)
  db.update(passwords).set({ hash: newHash }).where(eq(passwords.id, pw.id)).run()

  const keys = await redis.keys(`${SESSION_ADMIN_PREFIX}*`)
  if (keys.length > 0) {
    await redis.del(keys)
  }

  return c.json(ok({}, '修改成功'), HttpStatusCodes.OK)
}

export async function logout(c: Context) {
  const token = getCurrentToken(c)
  if (token) {
    await redis.del(`${SESSION_ADMIN_PREFIX}${token}`)
    c.header('set-cookie', '3qrain_token=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0')
  }
  return c.json(ok({}, '已退出'), HttpStatusCodes.OK)
}
