import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "~/constants/http-status-codes";
import { baseResponseSchema, createResponseSchema } from "~/utils/response";

// --- Request Schemas ---

export const passwordSchema = z.object({
  password: z.string().min(6),
});

export const setupSchema = z.object({
  password: z.string().min(6),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(6),
  newPassword: z.string().min(6),
});

export const recoverSchema = z.object({
  recoveryKey: z.string().min(32),
});

// --- Response Schemas ---

const initializedData = z.object({ initialized: z.boolean() });
const recoveryKeyData = z.object({ recoveryKey: z.string() });
const newRecoveryKeyData = z.object({ newRecoveryKey: z.string() });

// --- Routes ---

export const statusRoute = createRoute({
  tags: ["Auth"],
  summary: "检查初始化状态",
  method: "get",
  path: "/status",
  responses: {
    [HttpStatusCodes.OK]: {
      content: { "application/json": { schema: createResponseSchema(initializedData) } },
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
    body: { content: { "application/json": { schema: setupSchema } } },
  },
  responses: {
    [HttpStatusCodes.CREATED]: {
      content: { "application/json": { schema: createResponseSchema(recoveryKeyData) } },
      description: "设置成功",
    },
    [HttpStatusCodes.CONFLICT]: {
      content: { "application/json": { schema: baseResponseSchema } },
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
    [HttpStatusCodes.OK]: { content: { "application/json": { schema: baseResponseSchema } }, description: "登录成功" },
    [HttpStatusCodes.BAD_REQUEST]: { content: { "application/json": { schema: baseResponseSchema } }, description: "尚未初始化" },
    [HttpStatusCodes.UNAUTHORIZED]: { content: { "application/json": { schema: baseResponseSchema } }, description: "密码错误" },
  },
});

export const changePasswordRoute = createRoute({
  tags: ["Auth"],
  summary: "修改密码",
  method: "post",
  path: "/change-password",
  request: {
    body: { content: { "application/json": { schema: changePasswordSchema } } },
  },
  responses: {
    [HttpStatusCodes.OK]: { content: { "application/json": { schema: baseResponseSchema } }, description: "修改成功" },
    [HttpStatusCodes.BAD_REQUEST]: { content: { "application/json": { schema: baseResponseSchema } }, description: "尚未初始化" },
    [HttpStatusCodes.UNAUTHORIZED]: { content: { "application/json": { schema: baseResponseSchema } }, description: "旧密码错误" },
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
      content: { "application/json": { schema: createResponseSchema(newRecoveryKeyData) } },
      description: "恢复成功",
    },
    [HttpStatusCodes.BAD_REQUEST]: { content: { "application/json": { schema: baseResponseSchema } }, description: "无有效恢复密钥" },
    [HttpStatusCodes.UNAUTHORIZED]: { content: { "application/json": { schema: baseResponseSchema } }, description: "恢复密钥错误" },
  },
});

export const logoutRoute = createRoute({
  tags: ["Auth"],
  summary: "退出登录",
  method: "post",
  path: "/logout",
  responses: {
    [HttpStatusCodes.OK]: { content: { "application/json": { schema: baseResponseSchema } }, description: "退出成功" },
  },
});
