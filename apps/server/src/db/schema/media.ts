import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { timestamps } from "./columns.helpers";

export const media = sqliteTable("media", {
  id: integer().primaryKey({ autoIncrement: true }),

  // ===== 文件事实层 =====
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  type: text("type").notNull(),              // image | video | audio | file 
  ext: text("ext"),

  // ===== 存储路径 =====
  originalPath: text("original_path").notNull(),
  thumbnailPath: text("thumbnail_path"),     // 缩略图 可为空（非图片/音频）
  previewPath: text("preview_path"),     // 预览图
  placeholder: text("placeholder"),  // base64

  // ===== 图片信息 =====
  width: integer("width"),
  height: integer("height"),

  // ===== 业务信息 =====
  filename: text("filename").notNull(),

  // ===== 时间 =====
  ...timestamps,
});