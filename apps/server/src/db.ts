import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import Redis from "ioredis";
import * as schema from "~/db/schema";

// --- SQLite ---

const sqlite = new Database("data/3qrain.db");
sqlite.run("PRAGMA journal_mode=WAL");

export const db = drizzle(sqlite, { schema, casing: "snake_case" });

// --- Redis ---

export const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

redis.on("connect", () => {
  console.log("[Redis] connected");
});

redis.on("error", (err) => {
  console.error("[Redis] error:", err.message);
});

export async function connectDB() {
  console.log("[SQLite] connected");
}
