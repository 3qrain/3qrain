import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "~/constants/http-status-codes";
import { successResponseSchema, errorResponseSchema } from "~/utils/response";
import { FullConfigSchema } from "./configs.schema";

// --- Routes ---

export const getConfigRoute = createRoute({
  tags: ["Admin/Config"],
  summary: "获取所有配置",
  method: "get",
  path: "/config",
  responses: {
    [HttpStatusCodes.OK]: {
      content: { "application/json": { schema: successResponseSchema(FullConfigSchema) } },
      description: "所有配置",
    },
  },
});

export const getConfigByKeyRoute = createRoute({
  tags: ["Admin/Config"],
  summary: "获取指定配置",
  method: "get",
  path: "/config/{key}",
  request: { params: z.object({ key: z.string() }) },
  responses: {
    [HttpStatusCodes.OK]: {
      content: { "application/json": { schema: successResponseSchema(z.record(z.string(), z.unknown())) } },
      description: "配置值",
    },
    [HttpStatusCodes.NOT_FOUND]: {
      content: { "application/json": { schema: errorResponseSchema } },
      description: "配置不存在",
    },
  },
});

export const updateConfigRoute = createRoute({
  tags: ["Admin/Config"],
  summary: "更新配置",
  method: "patch",
  path: "/config/{key}",
  request: {
    params: z.object({ key: z.string() }),
  },
  responses: {
    [HttpStatusCodes.OK]: {
      content: { "application/json": { schema: successResponseSchema(z.record(z.string(), z.unknown())) } },
      description: "更新成功",
    },
    [HttpStatusCodes.BAD_REQUEST]: {
      content: { "application/json": { schema: errorResponseSchema } },
      description: "参数校验失败",
    },
    [HttpStatusCodes.NOT_FOUND]: {
      content: { "application/json": { schema: errorResponseSchema } },
      description: "配置键不存在",
    },
  },
});
