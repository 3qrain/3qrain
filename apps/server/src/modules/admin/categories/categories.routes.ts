import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "~/constants/http-status-codes";
import { successResponseSchema, errorResponseSchema } from "~/utils/response";

// --- Request Schemas ---

export const createCategorySchema = z.object({
  name: z.string().min(1, "分类名称不能为空"),
  slug: z.string().min(1, "分类标识不能为空"),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1, "分类名称不能为空").optional(),
  slug: z.string().min(1, "分类标识不能为空").optional(),
});

// --- Response Schemas ---

const categorySchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
});

export const categoryListSchema = z.array(categorySchema);
export const categoryResponseSchema = categorySchema;

// --- Routes ---

export const listCategoriesRoute = createRoute({
  tags: ["Admin Categories"],
  summary: "获取分类列表",
  method: "get",
  path: "/categories",
  responses: {
    [HttpStatusCodes.OK]: {
      content: { "application/json": { schema: successResponseSchema(categoryListSchema) } },
      description: "分类列表",
    },
  },
});

export const createCategoryRoute = createRoute({
  tags: ["Admin Categories"],
  summary: "创建分类",
  method: "post",
  path: "/categories",
  request: {
    body: { content: { "application/json": { schema: createCategorySchema } } },
  },
  responses: {
    [HttpStatusCodes.CREATED]: {
      content: { "application/json": { schema: successResponseSchema(categoryResponseSchema) } },
      description: "创建成功",
    },
    [HttpStatusCodes.CONFLICT]: {
      content: { "application/json": { schema: errorResponseSchema } },
      description: "名称或标识已存在",
    },
  },
});

export const updateCategoryRoute = createRoute({
  tags: ["Admin Categories"],
  summary: "更新分类",
  method: "patch",
  path: "/categories/{id}",
  request: {
    params: z.object({ id: z.string() }),
    body: { content: { "application/json": { schema: updateCategorySchema } } },
  },
  responses: {
    [HttpStatusCodes.OK]: {
      content: { "application/json": { schema: successResponseSchema(categoryResponseSchema) } },
      description: "更新成功",
    },
    [HttpStatusCodes.NOT_FOUND]: {
      content: { "application/json": { schema: errorResponseSchema } },
      description: "分类不存在",
    },
    [HttpStatusCodes.CONFLICT]: {
      content: { "application/json": { schema: errorResponseSchema } },
      description: "名称或标识冲突",
    },
  },
});

export const deleteCategoryRoute = createRoute({
  tags: ["Admin Categories"],
  summary: "删除分类",
  method: "delete",
  path: "/categories/{id}",
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    [HttpStatusCodes.OK]: {
      content: { "application/json": { schema: successResponseSchema(z.object({})) } },
      description: "删除成功",
    },
    [HttpStatusCodes.NOT_FOUND]: {
      content: { "application/json": { schema: errorResponseSchema } },
      description: "分类不存在",
    },
    [HttpStatusCodes.CONFLICT]: {
      content: { "application/json": { schema: errorResponseSchema } },
      description: "分类下存在文章",
    },
  },
});
