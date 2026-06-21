import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema/",
  out: "./drizzle",
  dialect: "sqlite",
  casing: "snake_case",
  dbCredentials: {
    url: "data/db/3qrain.db",
  },
});
