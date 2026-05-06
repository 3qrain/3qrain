import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "~/constants/http-status-codes";
import { successResponseSchema, errorResponseSchema } from "~/utils/response";

// --- Request Schemas ---

export const passwordSchema = z.object({
  password: z.string().min(6, "密码长度至少6位"),
});

export const recoverSchema = z.object({
  recoveryKey: z.string().min(32, "恢复密钥长度至少32位"),
});

// --- Response Schemas ---

const initializedData = z.object({ initialized: z.boolean() });
const recoveryKeyData = z.object({ recoveryKey: z.string().min(32) });
const newRecoveryKeyData = z.object({ newRecoveryKey: z.string().min(32) });

// --- Routes ---

export const statusRoute = createRoute({
  tags: ["Auth"],
  summary: "检查初始化状态",
  method: "get",
  path: "/status",
  responses: {
    [HttpStatusCodes.OK]: {
      content: { "application/json": { schema: successResponseSchema(initializedData) } },
      description: "初始化状态",
    },
  },
});

export const setupRoute = createRoute({
  tags: ["Auth"],
  summary: "首次设置密码",
  method: "post",
  path: "/setup",
  request: {
    body: { content: { "application/json": { schema: passwordSchema } } },
  },
  responses: {
    [HttpStatusCodes.CREATED]: {
      content: { "application/json": { schema: successResponseSchema(recoveryKeyData) } },
      description: "设置成功",
    },
    [HttpStatusCodes.CONFLICT]: {
      content: { "application/json": { schema: errorResponseSchema } },
      description: "已初始化过",
    },
  },
});

export const loginRoute = createRoute({
  tags: ["Auth"],
  summary: "密码登录",
  method: "post",
  path: "/login",
  request: {
    body: { content: { "application/json": { schema: passwordSchema } } },
  },
  responses: {
    [HttpStatusCodes.OK]: { content: { "application/json": { schema: successResponseSchema(z.object({})) } }, description: "登录成功" },
    [HttpStatusCodes.BAD_REQUEST]: { content: { "application/json": { schema: errorResponseSchema } }, description: "尚未初始化" },
    [HttpStatusCodes.UNAUTHORIZED]: { content: { "application/json": { schema: errorResponseSchema } }, description: "密码错误" },
  },
});

export const recoverRoute = createRoute({
  tags: ["Auth"],
  summary: "恢复密钥重置密码",
  method: "post",
  path: "/recover",
  request: {
    body: { content: { "application/json": { schema: recoverSchema } } },
  },
  responses: {
    [HttpStatusCodes.OK]: {
      content: { "application/json": { schema: successResponseSchema(newRecoveryKeyData) } },
      description: "恢复成功",
    },
    [HttpStatusCodes.BAD_REQUEST]: { content: { "application/json": { schema: errorResponseSchema } }, description: "无有效恢复密钥" },
    [HttpStatusCodes.UNAUTHORIZED]: { content: { "application/json": { schema: errorResponseSchema } }, description: "恢复密钥错误" },
  },
});
