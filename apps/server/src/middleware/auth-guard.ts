import { createMiddleware } from "hono/factory";
import { redis } from "~/db";

const TOKEN_TTL = Number(process.env.TOKEN_TTL) || 2592000;

export const authGuard = createMiddleware(async (c, next) => {
  const cookie = c.req.header("cookie") || "";
  const match = cookie.match(/token=([^;]+)/);
  const token = match?.[1];

  if (!token) {
    return c.json({ error: "未登录" }, 401);
  }

  const exists = await redis.exists(`session:${token}`);
  if (!exists) {
    return c.json({ error: "未登录" }, 401);
  }

  await redis.expire(`session:${token}`, TOKEN_TTL);

  await next();
});
