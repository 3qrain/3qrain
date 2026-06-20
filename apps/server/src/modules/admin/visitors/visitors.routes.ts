import { createRoute, z } from '@hono/zod-openapi'
import * as HttpStatusCodes from '~/constants/http-status-codes'
import { successResponseSchema, errorResponseSchema } from '~/utils/response'

const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string(),
  avatarUrl: z.string(),
  isAdmin: z.boolean(),
  isBanned: z.boolean(),
  provider: z.string(),
  createdAt: z.number(),
})

const updateVisitorSchema = z.object({
  isAdmin: z.boolean().optional(),
  isBanned: z.boolean().optional(),
}).strict()

export const listVisitorsRoute = createRoute({
  tags: ['Admin/Visitors'],
  summary: '访客列表',
  method: 'get',
  path: '/visitors',
  responses: {
    [HttpStatusCodes.OK]: {
      content: { 'application/json': { schema: successResponseSchema(z.array(userSchema)) } },
      description: '获取成功',
    },
  },
})

export const updateVisitorRoute = createRoute({
  tags: ['Admin/Visitors'],
  summary: '更新访客状态',
  method: 'patch',
  path: '/visitors/{id}',
  request: {
    params: z.object({ id: z.string() }),
    body: { content: { 'application/json': { schema: updateVisitorSchema } } },
  },
  responses: {
    [HttpStatusCodes.OK]: {
      content: { 'application/json': { schema: successResponseSchema(userSchema) } },
      description: '更新成功',
    },
    [HttpStatusCodes.NOT_FOUND]: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: '用户不存在',
    },
    [HttpStatusCodes.BAD_REQUEST]: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: '参数错误',
    },
  },
})
