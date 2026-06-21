import { createRoute, z } from '@hono/zod-openapi'
import * as HttpStatusCodes from '~/constants/http-status-codes'
import { successResponseSchema, errorResponseSchema } from '~/utils/response'

// --- Schemas ---

const profileSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string(),
  avatarUrl: z.string(),
})

const updateProfileSchema = z.object({
  username: z.string().min(1, '昵称不能为空').optional(),
  email: z.email('邮箱格式不正确').optional(),
  avatarUrl: z.string().optional(),
}).strict()

const changePasswordSchema = z.object({
  oldPassword: z.string().min(6, '旧密码长度至少6位'),
  newPassword: z.string().min(6, '新密码长度至少6位'),
})

// --- Routes ---

export const getProfileRoute = createRoute({
  tags: ['Admin/Account'],
  summary: '获取管理员资料',
  method: 'get',
  path: '/profile',
  responses: {
    [HttpStatusCodes.OK]: {
      content: { 'application/json': { schema: successResponseSchema(profileSchema) } },
      description: '获取成功',
    },
  },
})

export const updateProfileRoute = createRoute({
  tags: ['Admin/Account'],
  summary: '更新管理员资料',
  method: 'patch',
  path: '/profile',
  request: {
    body: { content: { 'application/json': { schema: updateProfileSchema } } },
  },
  responses: {
    [HttpStatusCodes.OK]: {
      content: { 'application/json': { schema: successResponseSchema(profileSchema) } },
      description: '更新成功',
    },
  },
})

export const changePasswordRoute = createRoute({
  tags: ['Admin/Account'],
  summary: '修改密码',
  method: 'post',
  path: '/change-password',
  request: {
    body: { content: { 'application/json': { schema: changePasswordSchema } } },
  },
  responses: {
    [HttpStatusCodes.OK]: { content: { 'application/json': { schema: successResponseSchema(z.object({})) } }, description: '修改成功' },
    [HttpStatusCodes.BAD_REQUEST]: { content: { 'application/json': { schema: errorResponseSchema } }, description: '旧密码错误或尚未初始化' },
  },
})

export const logoutRoute = createRoute({
  tags: ['Admin/Account'],
  summary: '退出登录',
  method: 'post',
  path: '/logout',
  responses: {
    [HttpStatusCodes.OK]: { content: { 'application/json': { schema: successResponseSchema(z.object({})) } }, description: '退出成功' },
  },
})
