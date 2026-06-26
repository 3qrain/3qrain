import { createRoute, z } from '@hono/zod-openapi'
import * as HttpStatusCodes from '~/constants/http-status-codes'
import { successResponseSchema, errorResponseSchema } from '~/utils/response'

const contentTypeEnum = z.enum(['post'])

export const recordViewSchema = z.object({
  contentId: z.number().int().positive(),
  contentType: contentTypeEnum,
  visitorId: z.string().min(1).max(128),
})

const viewCountSchema = z.object({ viewCount: z.number() })

export const recordViewRoute = createRoute({
  tags: ['Public/View'],
  summary: '登记浏览',
  method: 'post',
  path: '/view',
  request: {
    body: { content: { 'application/json': { schema: recordViewSchema } } },
  },
  responses: {
    [HttpStatusCodes.OK]: {
      content: { 'application/json': { schema: successResponseSchema(viewCountSchema) } },
      description: '已记录或已存在',
    },
    [HttpStatusCodes.BAD_REQUEST]: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: '参数校验失败',
    },
    [HttpStatusCodes.NOT_FOUND]: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: '内容不存在',
    },
  },
})

export const countViewRoute = createRoute({
  tags: ['Public/View'],
  summary: '获取浏览量',
  method: 'get',
  path: '/view/count',
  request: {
    query: z.object({
      contentType: contentTypeEnum,
      contentId: z.string(),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: {
      content: { 'application/json': { schema: successResponseSchema(viewCountSchema) } },
      description: '浏览量',
    },
    [HttpStatusCodes.BAD_REQUEST]: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: '参数校验失败',
    },
    [HttpStatusCodes.NOT_FOUND]: {
      content: { 'application/json': { schema: errorResponseSchema } },
      description: '内容不存在',
    },
  },
})
