import { z } from "@hono/zod-openapi";

// --- Schema route契约层 ---

export const successResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    code: z.string().min(1),
    message: z.string().min(1),
    timestamp: z.number(),
    // data: dataSchema.optional(), optional + 泛型导致 zod-openapi 推导异常，导致产生的接口文档中响应都没有data字段，暂时改为必填
    data: dataSchema,
  });

export const errorResponseSchema = z.object({
  success: z.literal(false),
  code: z.string().min(1),
  message: z.string().min(1),
  timestamp: z.number(),
});

// --- Helpers handlers行为层---

export function ok<T>(data: T, message = "成功") {
  return {
    success: true as const,
    code: "OK",
    message,
    timestamp: Date.now(),
    data,
  };
}

export function fail(code: string, message: string) {
  return {
    success: false as const,
    code,
    message,
    timestamp: Date.now(),
  };
}
