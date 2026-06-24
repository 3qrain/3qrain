import { createRoute, z } from '@hono/zod-openapi'
import * as HttpStatusCodes from '~/constants/http-status-codes'
import { successResponseSchema } from '~/utils/response'

const tagSchema = z.object({ id: z.number(), name: z.string(), slug: z.string() })

const noteMediaSchema = z.object({
  id: z.number(),
  url: z.string().nullable(),
  thumbnailUrl: z.string().nullable(),
  placeholder: z.string().nullable(),
  type: z.string(),
  mimeType: z.string(),
  width: z.number().nullable(),
  height: z.number().nullable(),
  sort: z.number(),
})

const noteItemSchema = z.object({
  id: z.number(),
  content: z.string(),
  createdAt: z.string(),
  tags: z.array(tagSchema),
  media: z.array(noteMediaSchema),
})

const noteListSchema = z.object({
  list: z.array(noteItemSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
})

export const listNotesRoute = createRoute({
  tags: ['Public/Notes'],
  summary: '获取说说列表',
  method: 'get',
  path: '/notes',
  request: {
    query: z.object({
      page: z.string().optional(),
      pageSize: z.string().optional(),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: {
      content: { 'application/json': { schema: successResponseSchema(noteListSchema) } },
      description: '说说列表',
    },
  },
})
