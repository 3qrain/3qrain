import { createRoute, z } from '@hono/zod-openapi'
import * as HttpStatusCodes from '~/constants/http-status-codes'

export const listRoute = createRoute({
  method: 'get',
  path: '/notifications',
  request: { query: z.object({ page: z.string().optional(), pageSize: z.string().optional(), type: z.string().optional() }) },
  responses: { [HttpStatusCodes.OK]: { description: 'ok' } },
})

export const unreadCountRoute = createRoute({
  method: 'get',
  path: '/notifications/unread-count',
  responses: { [HttpStatusCodes.OK]: { description: 'ok' } },
})

export const markReadRoute = createRoute({
  method: 'patch',
  path: '/notifications/{id}/read',
  request: { params: z.object({ id: z.string() }) },
  responses: { [HttpStatusCodes.OK]: { description: 'ok' } },
})

export const markAllReadRoute = createRoute({
  method: 'patch',
  path: '/notifications/read-all',
  responses: { [HttpStatusCodes.OK]: { description: 'ok' } },
})

export const destroyRoute = createRoute({
  method: 'delete',
  path: '/notifications/{id}',
  request: { params: z.object({ id: z.string() }) },
  responses: { [HttpStatusCodes.OK]: { description: 'ok' } },
})

export const clearReadRoute = createRoute({
  method: 'delete',
  path: '/notifications',
  responses: { [HttpStatusCodes.OK]: { description: 'ok' } },
})
