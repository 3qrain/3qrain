import { z } from "@hono/zod-openapi";

export const SESSION_ADMIN_PREFIX = "3qrain:session:admin:";
export const SESSION_USER_PREFIX = "3qrain:session:user:";

export const sessionValueSchema = z.object({
  role: z.literal('system'),
  loginIp: z.string(),
  userAgent: z.string(),
  createdAt: z.number(),
  lastActiveAt: z.number(),
})

export type SessionValue = z.infer<typeof sessionValueSchema>

export const userSessionValueSchema = z.object({
  role: z.enum(['visitor', 'admin']),
  userId: z.number(),
  createdAt: z.number(),
  lastActiveAt: z.number(),
})

export type UserSessionValue = z.infer<typeof userSessionValueSchema>;
