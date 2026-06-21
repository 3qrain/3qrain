import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import Redis from "ioredis";
import * as schema from "~/db/schema";

import { mkdirSync } from 'fs'

// --- SQLite ---

mkdirSync('data/db', { recursive: true })
const sqlite = new Database("data/db/3qrain.db");
sqlite.run("PRAGMA journal_mode=WAL");

export const db = drizzle(sqlite, { schema, casing: "snake_case" });

// --- Redis ---

export const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

redis.on("connect", () => {
  console.log("[Redis] connected");
});

redis.on("error", (err: any) => {
  if (err?.code === "ECONNREFUSED" || err?.syscall === "connect") {
    console.error("[Redis] connection refused, disconnecting ");
    redis.disconnect();
    redis.removeAllListeners();
    return;
  }
  console.error("[Redis] error:", err);
});

