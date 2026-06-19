import type { Context } from "hono";
import { eq, count, getTableColumns } from "drizzle-orm";
import { db } from "~/db";
import { categories, posts } from "~/db/schema";
import { ok, fail } from "~/utils/response";
import { ErrorCode } from "@3qrain/shared";
import * as HttpStatusCodes from "~/constants/http-status-codes";

export async function list(c: Context) {
  const result = db
    .select({
      ...getTableColumns(categories),
      postCount: count(posts.id),
    })
    .from(categories)
    .leftJoin(posts, eq(posts.categoryId, categories.id))
    .groupBy(categories.id)
    .all();
  return c.json(ok(result, "获取成功"), HttpStatusCodes.OK);
}

export async function create(c: Context) {
  const { name, slug } = await c.req.json<{ name: string; slug: string }>();

  const nameExists = db.select().from(categories).where(eq(categories.name, name)).get();
  if (nameExists) {
    return c.json(fail(ErrorCode.CATEGORY_NAME_EXISTS, "分类名称已存在"), HttpStatusCodes.CONFLICT);
  }

  const slugExists = db.select().from(categories).where(eq(categories.slug, slug)).get();
  if (slugExists) {
    return c.json(fail(ErrorCode.CATEGORY_SLUG_EXISTS, "分类标识已存在"), HttpStatusCodes.CONFLICT);
  }

  const result = db.insert(categories).values({ name, slug }).returning().get();
  return c.json(ok(result, "创建成功"), HttpStatusCodes.CREATED);
}

export async function update(c: Context) {
  const id = Number.parseInt(c.req.param("id")!);
  const body = await c.req.json<{ name?: string; slug?: string }>();

  const existing = db.select().from(categories).where(eq(categories.id, id)).get();
  if (!existing) {
    return c.json(fail(ErrorCode.CATEGORY_NOT_FOUND, "分类不存在"), HttpStatusCodes.NOT_FOUND);
  }

  if (body.name !== undefined && body.name !== existing.name) {
    const dup = db.select().from(categories).where(eq(categories.name, body.name)).get();
    if (dup) {
      return c.json(fail(ErrorCode.CATEGORY_NAME_EXISTS, "分类名称已存在"), HttpStatusCodes.CONFLICT);
    }
  }

  if (body.slug !== undefined && body.slug !== existing.slug) {
    const dup = db.select().from(categories).where(eq(categories.slug, body.slug)).get();
    if (dup) {
      return c.json(fail(ErrorCode.CATEGORY_SLUG_EXISTS, "分类标识已存在"), HttpStatusCodes.CONFLICT);
    }
  }

  const result = db.update(categories).set(body).where(eq(categories.id, id)).returning().get();
  return c.json(ok(result, "更新成功"), HttpStatusCodes.OK);
}

export async function remove(c: Context) {
  const id = Number.parseInt(c.req.param("id")!);

  const existing = db.select().from(categories).where(eq(categories.id, id)).get();
  if (!existing) {
    return c.json(fail(ErrorCode.CATEGORY_NOT_FOUND, "分类不存在"), HttpStatusCodes.NOT_FOUND);
  }

  const postCount = db.select().from(posts).where(eq(posts.categoryId, id)).all().length;
  if (postCount > 0) {
    return c.json(fail(ErrorCode.CATEGORY_HAS_POSTS, "分类下存在文章，无法删除"), HttpStatusCodes.CONFLICT);
  }

  db.delete(categories).where(eq(categories.id, id)).run();
  return c.json(ok({}, "删除成功"), HttpStatusCodes.OK);
}
