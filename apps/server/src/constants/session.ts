import { z } from "@hono/zod-openapi";

export const SESSION_ADMIN_PREFIX = "3qrain:session:admin:";

export const sessionValueSchema = z.object({
  role: z.literal("admin"),
  loginIp: z.string(),
  userAgent: z.string(),
  createdAt: z.number(),
  lastActiveAt: z.number(),
});

export type SessionValue = z.infer<typeof sessionValueSchema>;
