import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { timestamps } from "./columns.helpers";
import { categories } from "./categories";

export const posts = sqliteTable("posts", {
  id: integer().primaryKey({ autoIncrement: true }),
  title: text().notNull().default(""),
  slug: text().unique(),
  summary: text().notNull().default(""),
  cover: text().notNull().default(""),
  content: text().notNull().default(""),
  contentHtml: text("content_html").notNull().default(""),
  contentText: text("content_text").notNull().default(""),
  status: text().notNull().default("draft"),
  isPinned: integer({ mode: "boolean" }).notNull().default(false),
  viewCount: integer().notNull().default(0),
  categoryId: integer("category_id").references(() => categories.id),
  deletedAt: integer({ mode: "timestamp_ms" }),
  ...timestamps,
});
