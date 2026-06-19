import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { timestamps } from "./columns.helpers";

export const configs = sqliteTable("configs", {
  id: integer().primaryKey({ autoIncrement: true }),
  key: text().notNull().unique(),
  value: text().notNull().default("{}"),
  ...timestamps,
});
