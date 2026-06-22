import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { timestamps } from "./columns.helpers";

export const recoveryKeys = sqliteTable("recovery_keys", {
  id: integer().primaryKey({ autoIncrement: true }),
  hash: text().notNull(),
  ...timestamps,
});
