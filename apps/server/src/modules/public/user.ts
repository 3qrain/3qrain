import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { z } from '@hono/zod-openapi'
import { db, redis } from '~/db'
import { users } from '~/db/schema'
import { ok, fail } from '~/utils/response'
import * as HttpStatusCodes from '~/constants/http-status-codes'
import { ErrorCode } from '@3qrain/shared'
import { SESSION_USER_PREFIX, userSessionValueSchema } from '~/constants/session'

const TOKEN_TTL = Number(process.env.TOKEN_TTL) || 86400

async function resolveSession(c: any) {
  const cookie = c.req.header('cookie') || ''
  const match = cookie.match(/3qrain_user_token=([^;]+)/)
  if (!match) return null

  const raw = await redis.get(`${SESSION_USER_PREFIX}${match[1]}`)
  if (!raw) return null

  const parsed = userSessionValueSchema.safeParse(JSON.parse(raw))
  if (!parsed.success) return null

  const user = db.select().from(users).where(eq(users.id, parsed.data.userId)).get()
  if (!user) return null

  await redis.setex(
    `${SESSION_USER_PREFIX}${match[1]}`,
    TOKEN_TTL,
    JSON.stringify({ ...parsed.data, lastActiveAt: Date.now() }),
  )

  return { token: match[1], user }
}

const userRouter = new Hono()

userRouter.get('/user/me', async (c) => {
  const session = await resolveSession(c)
  if (!session) {
    return c.json(ok(null, '未登录'), HttpStatusCodes.OK)
  }
  const { user } = session
  return c.json(
    ok({ id: user.id, username: user.username, email: user.email, avatarUrl: user.avatarUrl, role: user.role }, '获取成功'),
    HttpStatusCodes.OK,
  )
})

const updateProfileSchema = z.object({
  username: z.string().min(1, '昵称不能为空').optional(),
  email: z.string().email('邮箱格式不正确').optional(),
}).strict()

userRouter.patch('/user/me', async (c) => {
  const session = await resolveSession(c)
  if (!session) {
    return c.json(fail(ErrorCode.UNAUTHORIZED, '未登录'), HttpStatusCodes.UNAUTHORIZED)
  }

  const body = await c.req.json()
  const parsed = updateProfileSchema.safeParse(body)
  if (!parsed.success) {
    return c.json(fail(ErrorCode.INVALID_PARAMS, parsed.error.issues[0].message), HttpStatusCodes.BAD_REQUEST)
  }

  const updated = db
    .update(users)
    .set(parsed.data)
    .where(eq(users.id, session.user.id))
    .returning()
    .get()

  return c.json(
    ok({ id: updated.id, username: updated.username, email: updated.email, avatarUrl: updated.avatarUrl }, '更新成功'),
    HttpStatusCodes.OK,
  )
})

userRouter.post('/user/logout', async (c) => {
  const cookie = c.req.header('cookie') || ''
  const match = cookie.match(/3qrain_user_token=([^;]+)/)
  if (match) {
    await redis.del(`${SESSION_USER_PREFIX}${match[1]}`)
    c.header('set-cookie', '3qrain_user_token=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0')
  }
  return c.json(ok({}, '已退出'), HttpStatusCodes.OK)
})

export default userRouter
