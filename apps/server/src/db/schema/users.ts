import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { timestamps } from "./columns.helpers";

export const users = sqliteTable('users', {
  id: integer().primaryKey({ autoIncrement: true }),
  githubId: integer('github_id').unique(),
  googleId: text('google_id').unique(),
  username: text().notNull(),
  email: text().notNull().default(''),
  avatarUrl: text('avatar_url').notNull().default(''),
  role: text({ enum: ['system', 'admin', 'visitor'] }).notNull().default('visitor'),
  isBanned: integer('is_banned', { mode: 'boolean' }).notNull().default(false),
  ...timestamps,
})
