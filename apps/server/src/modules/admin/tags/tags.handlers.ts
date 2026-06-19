import type { Context } from "hono";
import { eq, count, getTableColumns } from "drizzle-orm";
import { db } from "~/db";
import { tags, postTags } from "~/db/schema";
import { ok, fail } from "~/utils/response";
import { ErrorCode } from "@3qrain/shared";
import * as HttpStatusCodes from "~/constants/http-status-codes";

export async function list(c: Context) {
  const result = db
    .select({
      ...getTableColumns(tags),
      postCount: count(postTags.postId),
    })
    .from(tags)
    .leftJoin(postTags, eq(postTags.tagId, tags.id))
    .groupBy(tags.id)
    .all();
  return c.json(ok(result, "获取成功"), HttpStatusCodes.OK);
}

export async function create(c: Context) {
  const { name, slug } = await c.req.json<{ name: string; slug: string }>();

  const nameExists = db.select().from(tags).where(eq(tags.name, name)).get();
  if (nameExists) {
    return c.json(fail(ErrorCode.TAG_NAME_EXISTS, "标签名称已存在"), HttpStatusCodes.CONFLICT);
  }

  const slugExists = db.select().from(tags).where(eq(tags.slug, slug)).get();
  if (slugExists) {
    return c.json(fail(ErrorCode.TAG_SLUG_EXISTS, "标签标识已存在"), HttpStatusCodes.CONFLICT);
  }

  const result = db.insert(tags).values({ name, slug }).returning().get();
  return c.json(ok(result, "创建成功"), HttpStatusCodes.CREATED);
}

export async function update(c: Context) {
  const id = Number.parseInt(c.req.param("id")!);
  const body = await c.req.json<{ name?: string; slug?: string }>();

  const existing = db.select().from(tags).where(eq(tags.id, id)).get();
  if (!existing) {
    return c.json(fail(ErrorCode.TAG_NOT_FOUND, "标签不存在"), HttpStatusCodes.NOT_FOUND);
  }

  if (body.name !== undefined && body.name !== existing.name) {
    const dup = db.select().from(tags).where(eq(tags.name, body.name)).get();
    if (dup) {
      return c.json(fail(ErrorCode.TAG_NAME_EXISTS, "标签名称已存在"), HttpStatusCodes.CONFLICT);
    }
  }

  if (body.slug !== undefined && body.slug !== existing.slug) {
    const dup = db.select().from(tags).where(eq(tags.slug, body.slug)).get();
    if (dup) {
      return c.json(fail(ErrorCode.TAG_SLUG_EXISTS, "标签标识已存在"), HttpStatusCodes.CONFLICT);
    }
  }

  const result = db.update(tags).set(body).where(eq(tags.id, id)).returning().get();
  return c.json(ok(result, "更新成功"), HttpStatusCodes.OK);
}

export async function remove(c: Context) {
  const id = Number.parseInt(c.req.param("id")!);

  const existing = db.select().from(tags).where(eq(tags.id, id)).get();
  if (!existing) {
    return c.json(fail(ErrorCode.TAG_NOT_FOUND, "标签不存在"), HttpStatusCodes.NOT_FOUND);
  }

  db.delete(tags).where(eq(tags.id, id)).run();
  return c.json(ok({}, "删除成功"), HttpStatusCodes.OK);
}
