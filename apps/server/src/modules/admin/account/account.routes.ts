import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "~/constants/http-status-codes";
import { successResponseSchema, errorResponseSchema } from "~/utils/response";

// --- Request Schemas ---

const changePasswordSchema = z.object({
  oldPassword: z.string().min(6, "旧密码长度至少6位"),
  newPassword: z.string().min(6, "新密码长度至少6位"),
});

// --- Routes ---

export const changePasswordRoute = createRoute({
  tags: ["Admin/Account"],
  summary: "修改密码",
  method: "post",
  path: "/change-password",
  request: {
    body: { content: { "application/json": { schema: changePasswordSchema } } },
  },
  responses: {
    [HttpStatusCodes.OK]: { content: { "application/json": { schema: successResponseSchema(z.object({})) } }, description: "修改成功" },
    [HttpStatusCodes.BAD_REQUEST]: { content: { "application/json": { schema: errorResponseSchema } }, description: "尚未初始化" },
    [HttpStatusCodes.UNAUTHORIZED]: { content: { "application/json": { schema: errorResponseSchema } }, description: "旧密码错误" },
  },
});

export const logoutRoute = createRoute({
  tags: ["Admin/Account"],
  summary: "退出登录",
  method: "post",
  path: "/logout",
  responses: {
    [HttpStatusCodes.OK]: { content: { "application/json": { schema: successResponseSchema(z.object({})) } }, description: "退出成功" },
  },
});
