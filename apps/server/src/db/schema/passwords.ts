import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { timestamps } from "./columns.helpers";

export const passwords = sqliteTable("passwords", {
  id: integer().primaryKey({ autoIncrement: true }),
  hash: text().notNull(),
  ...timestamps,
});
