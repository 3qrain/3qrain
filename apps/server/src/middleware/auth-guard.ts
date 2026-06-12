import { createMiddleware } from 'hono/factory'
import { redis } from '~/db'
import { fail } from '~/utils/response'
import { ErrorCode } from '@3qrain/shared'
import * as HttpStatusCodes from '~/constants/http-status-codes'
import { SESSION_ADMIN_PREFIX, sessionValueSchema } from '~/constants/session'

const TOKEN_TTL = Number(process.env.TOKEN_TTL) || 86400

export const authGuard = createMiddleware(async (c, next) => {
  // origin 校验
  const origin = c.req.header('Origin')
  if (!process.env.ALLOWED_ORIGINS) {
    throw new Error('ALLOWED_ORIGINS is not defined')
  }
  const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',')
  // get请求不带origin，记得排除掉
  if (origin && !allowedOrigins.includes(origin)) {
    return c.json(fail(ErrorCode.INVALID_ORIGIN, '禁止访问'), HttpStatusCodes.FORBIDDEN)
  }

  // cookie 校验
  const cookie = c.req.header('cookie') || ''
  const match = cookie.match(/3qrain_token=([^;]+)/)
  const token = match?.[1]

  if (!token) {
    return c.json(fail(ErrorCode.UNAUTHORIZED, '未登录'), HttpStatusCodes.UNAUTHORIZED)
  }

  const raw = await redis.get(`${SESSION_ADMIN_PREFIX}${token}`)
  if (!raw) {
    return c.json(fail(ErrorCode.UNAUTHORIZED, 'session不存在'), HttpStatusCodes.UNAUTHORIZED)
  }

  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch {
    return c.json(fail(ErrorCode.INTERNAL_ERROR, 'session数据值解析异常'), HttpStatusCodes.INTERNAL_SERVER_ERROR)
  }

  const result = sessionValueSchema.safeParse(parsed)
  if (!result.success) {
    return c.json(fail(ErrorCode.INTERNAL_ERROR, 'session数据值校验失败'), HttpStatusCodes.INTERNAL_SERVER_ERROR)
  }

  result.data.lastActiveAt = Date.now()
  await redis.setex(`${SESSION_ADMIN_PREFIX}${token}`, TOKEN_TTL, JSON.stringify(result.data))

  c.set('admin', true)

  await next()
})
