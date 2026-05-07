import type { Context } from "hono";
import { redis } from "~/db";
import { hashPassword, verifyPassword } from "~/utils/crypto";
import { ok, fail } from "~/utils/response";
import { PasswordModel } from "~/models/password.model";
import { ErrorCode } from "@3qrain/shared";
import * as HttpStatusCodes from "~/constants/http-status-codes";

import { SESSION_ADMIN_PREFIX } from "~/constants/session";

export async function changePassword(c: Context) {
  const { oldPassword, newPassword } = await c.req.json<{
    oldPassword: string;
    newPassword: string;
  }>();

  const pw = await PasswordModel.findOne();
  if (!pw) {
    return c.json(fail(ErrorCode.NOT_INITIALIZED, "尚未初始化"), HttpStatusCodes.BAD_REQUEST);
  }

  const valid = await verifyPassword(oldPassword, pw.hash);
  if (!valid) {
    return c.json(fail(ErrorCode.INVALID_PASSWORD, "旧密码错误"), HttpStatusCodes.UNAUTHORIZED);
  }

  pw.hash = await hashPassword(newPassword);
  await pw.save();

  const keys = await redis.keys(`${SESSION_ADMIN_PREFIX}*`);
  if (keys.length > 0) {
    await redis.del(keys);
  }

  return c.json(ok({}, "修改成功"), HttpStatusCodes.OK);
}

export async function logout(c: Context) {
  const cookie = c.req.header("cookie") || "";
  const match = cookie.match(/token=([^;]+)/);
  if (match) {
    await redis.del(`${SESSION_ADMIN_PREFIX}${match[1]}`);
    c.header(
      "set-cookie",
      "token=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0",
    );
  }
  return c.json(ok({}, "已退出"), HttpStatusCodes.OK);
}
