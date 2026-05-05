import { z } from "@hono/zod-openapi";

// --- Schema route契约层 ---

export const baseResponseSchema = z.object({
  success: z.boolean(),
  code: z.string(),
  message: z.string().min(1),
});

export const createResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  baseResponseSchema.extend({
    data: dataSchema.optional(),
  });

// --- Helpers handlers行为层---

export function ok<T>(data?: T, message = "成功") {
  return {
    success: true,
    code: "OK",
    message,
    data,
  };
}

export function fail(code: string, message: string) {
  return {
    success: false,
    code,
    message,
  };
}
