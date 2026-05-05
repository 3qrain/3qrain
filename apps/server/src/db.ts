import mongoose from "mongoose";
import Redis from "ioredis";

// --- MongoDB ---

mongoose.connection.on("error", (err) => {
  console.error("[MongoDB] error:", err.message);
});

mongoose.connection.once("open", () => {
  console.log("[MongoDB] connected");
});

mongoose.connection.on("disconnected", () => {
  console.log("[MongoDB] disconnected");
});

export async function connectDB() {
  await mongoose.connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/3qrain",
  );
}

// --- Redis ---

export const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

redis.on("connect", () => {
  console.log("[Redis] connected");
});

redis.on("error", (err) => {
  console.error("[Redis] error:", err.message);
});
