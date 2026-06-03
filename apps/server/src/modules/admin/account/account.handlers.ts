import type { Context } from "hono";
import { eq } from "drizzle-orm";
import { db, redis } from "~/db";
import { passwords } from "~/db/schema";
import { hashPassword, verifyPassword } from "~/utils/crypto";
import { ok, fail } from "~/utils/response";
import { ErrorCode } from "@3qrain/shared";
import * as HttpStatusCodes from "~/constants/http-status-codes";

import { SESSION_ADMIN_PREFIX } from "~/constants/session";

export async function changePassword(c: Context) {
  const { oldPassword, newPassword } = await c.req.json<{
    oldPassword: string;
    newPassword: string;
  }>();

  const pw = db.select().from(passwords).limit(1).all()[0];
  if (!pw) {
    return c.json(fail(ErrorCode.NOT_INITIALIZED, "尚未初始化"), HttpStatusCodes.BAD_REQUEST);
  }

  const valid = await verifyPassword(oldPassword, pw.hash);
  if (!valid) {
    return c.json(fail(ErrorCode.INVALID_PASSWORD, "旧密码错误"), HttpStatusCodes.UNAUTHORIZED);
  }

  const newHash = await hashPassword(newPassword);
  db.update(passwords).set({ hash: newHash }).where(eq(passwords.id, pw.id)).run();

  const keys = await redis.keys(`${SESSION_ADMIN_PREFIX}*`);
  if (keys.length > 0) {
    await redis.del(keys);
  }

  return c.json(ok({}, "修改成功"), HttpStatusCodes.OK);
}

export async function logout(c: Context) {
  const cookie = c.req.header("cookie") || "";
  const match = cookie.match(/3qrain_token=([^;]+)/);
  if (match) {
    await redis.del(`${SESSION_ADMIN_PREFIX}${match[1]}`);
    c.header(
      "set-cookie",
      "3qrain_token=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0",
    );
  }
  return c.json(ok({}, "已退出"), HttpStatusCodes.OK);
}
