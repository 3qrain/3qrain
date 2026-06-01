import type { Context } from "hono";
import { eq, like, and, desc, count as drizzleCount, inArray } from "drizzle-orm";
import { db } from "~/db";
import { posts, postTags, categories, tags } from "~/db/schema";
import { ok, fail } from "~/utils/response";
import { ErrorCode } from "@3qrain/shared";
import * as HttpStatusCodes from "~/constants/http-status-codes";

function buildPostFilters(query: Record<string, string | undefined>) {
  const conditions = [];

  if (query.keyword) {
    conditions.push(like(posts.title, `%${query.keyword}%`));
  }
  if (query.status) {
    conditions.push(eq(posts.status, query.status));
  }
  if (query.categoryId) {
    conditions.push(eq(posts.categoryId, Number.parseInt(query.categoryId)));
  }

  return conditions;
}

async function getPostWithRelations(postId: number) {
  const post = db.select().from(posts).where(eq(posts.id, postId)).get();
  if (!post) return null;

  const category = db.select().from(categories).where(eq(categories.id, post.categoryId)).get();

  const tagRows = db
    .select({ id: tags.id, name: tags.name, slug: tags.slug })
    .from(postTags)
    .innerJoin(tags, eq(postTags.tagId, tags.id))
    .where(eq(postTags.postId, postId))
    .all();

  return { ...post, category, tags: tagRows };
}

// 同步文章标签关系
async function syncPostTags(postId: number, tagIds: number[]) {
  db.delete(postTags).where(eq(postTags.postId, postId)).run();
  if (tagIds.length > 0) {
    db.insert(postTags)
      .values(tagIds.map((tagId) => ({ postId, tagId })))
      .run();
  }
}

// --- Handlers ---

export async function list(c: Context) {
  const query = c.req.query();
  const page = Number.parseInt(query.page || "1");
  const pageSize = Number.parseInt(query.pageSize || "10");
  const filters = buildPostFilters(query);

  const where = filters.length > 0 ? and(...filters) : undefined;

  const total = db.select({ count: drizzleCount() }).from(posts).where(where).get()!.count;

  const rows = db
    .select()
    .from(posts)
    .where(where)
    .orderBy(desc(posts.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize)
    .all();

  if (rows.length === 0) {
    return c.json(ok({ list: [], total, page, pageSize }, "获取成功"), HttpStatusCodes.OK);
  }

  const postIds = rows.map((p) => p.id);
  const catIds = [...new Set(rows.map((p) => p.categoryId))];

  const catMap = new Map(
    db.select().from(categories).where(inArray(categories.id, catIds)).all().map((c) => [c.id, c]),
  );

  const ptRows = db
    .select({ postId: postTags.postId, id: tags.id, name: tags.name, slug: tags.slug })
    .from(postTags)
    .innerJoin(tags, eq(postTags.tagId, tags.id))
    .where(inArray(postTags.postId, postIds))
    .all();

  const tagMap = new Map<number, { id: number; name: string; slug: string }[]>();
  for (const pt of ptRows) {
    if (!tagMap.has(pt.postId)) tagMap.set(pt.postId, []);
    tagMap.get(pt.postId)!.push({ id: pt.id, name: pt.name, slug: pt.slug });
  }

  const list = rows.map((p) => ({
    ...p,
    category: catMap.get(p.categoryId) || null,
    tags: tagMap.get(p.id) || [],
  }));

  return c.json(ok({ list, total, page, pageSize }, "获取成功"), HttpStatusCodes.OK);
}

export async function detail(c: Context) {
  const id = Number.parseInt(c.req.param("id")!);
  const post = await getPostWithRelations(id);
  if (!post) {
    return c.json(fail(ErrorCode.POST_NOT_FOUND, "文章不存在"), HttpStatusCodes.NOT_FOUND);
  }
  return c.json(ok(post, "获取成功"), HttpStatusCodes.OK);
}

export async function create(c: Context) {
  const body = await c.req.json<{
    title: string;
    slug: string;
    summary?: string;
    cover?: string;
    content?: string;
    status?: string;
    isPinned?: boolean;
    categoryId: number;
    tagIds?: number[];
  }>();

  const slugExists = db.select().from(posts).where(eq(posts.slug, body.slug)).get();
  if (slugExists) {
    return c.json(fail(ErrorCode.POST_SLUG_EXISTS, "文章标识已存在"), HttpStatusCodes.CONFLICT);
  }

  const category = db.select().from(categories).where(eq(categories.id, body.categoryId)).get();
  if (!category) {
    return c.json(fail(ErrorCode.CATEGORY_NOT_FOUND, "分类不存在"), HttpStatusCodes.NOT_FOUND);
  }

  const { tagIds = [], ...postData } = body;

  if (tagIds.length > 0) {
    const existingTags = db.select({ id: tags.id }).from(tags).where(inArray(tags.id, tagIds)).all();
    if (existingTags.length !== tagIds.length) {
      return c.json(fail(ErrorCode.TAG_NOT_FOUND, "标签不存在"), HttpStatusCodes.NOT_FOUND);
    }
  }

  const result = db.insert(posts).values(postData).returning().get();
  await syncPostTags(result.id, tagIds);

  const post = await getPostWithRelations(result.id);
  return c.json(ok(post, "创建成功"), HttpStatusCodes.CREATED);
}

export async function update(c: Context) {
  const id = Number.parseInt(c.req.param("id")!);
  const body = await c.req.json<{
    title?: string;
    slug?: string;
    summary?: string;
    cover?: string;
    content?: string;
    status?: string;
    isPinned?: boolean;
    categoryId?: number;
    tagIds?: number[];
  }>();

  const existing = db.select().from(posts).where(eq(posts.id, id)).get();
  if (!existing) {
    return c.json(fail(ErrorCode.POST_NOT_FOUND, "文章不存在"), HttpStatusCodes.NOT_FOUND);
  }

  if (body.slug !== undefined && body.slug !== existing.slug) {
    const dup = db.select().from(posts).where(eq(posts.slug, body.slug)).get();
    if (dup) {
      return c.json(fail(ErrorCode.POST_SLUG_EXISTS, "文章标识已存在"), HttpStatusCodes.CONFLICT);
    }
  }

  if (body.categoryId !== undefined) {
    const category = db.select().from(categories).where(eq(categories.id, body.categoryId)).get();
    if (!category) {
      return c.json(fail(ErrorCode.CATEGORY_NOT_FOUND, "分类不存在"), HttpStatusCodes.NOT_FOUND);
    }
  }

  const { tagIds, ...postData } = body;

  if (tagIds !== undefined && tagIds.length > 0) {
    const existingTags = db.select({ id: tags.id }).from(tags).where(inArray(tags.id, tagIds)).all();
    if (existingTags.length !== tagIds.length) {
      return c.json(fail(ErrorCode.TAG_NOT_FOUND, "标签不存在"), HttpStatusCodes.NOT_FOUND);
    }
  }

  db.update(posts).set(postData).where(eq(posts.id, id)).run();

  if (tagIds !== undefined) {
    await syncPostTags(id, tagIds);
  }

  const post = await getPostWithRelations(id);
  return c.json(ok(post, "更新成功"), HttpStatusCodes.OK);
}

export async function remove(c: Context) {
  const id = Number.parseInt(c.req.param("id")!);

  const existing = db.select().from(posts).where(eq(posts.id, id)).get();
  if (!existing) {
    return c.json(fail(ErrorCode.POST_NOT_FOUND, "文章不存在"), HttpStatusCodes.NOT_FOUND);
  }

  db.delete(postTags).where(eq(postTags.postId, id)).run();
  db.delete(posts).where(eq(posts.id, id)).run();
  return c.json(ok({}, "删除成功"), HttpStatusCodes.OK);
}
