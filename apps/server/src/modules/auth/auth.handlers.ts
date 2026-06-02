import type { Context } from "hono";
import { count, eq } from "drizzle-orm";
import { db, redis } from "~/db";
import { passwords, recoveryKeys } from "~/db/schema";
import { hashPassword, verifyPassword, generateToken } from "~/utils/crypto";
import { ok, fail } from "~/utils/response";
import { ErrorCode } from "@3qrain/shared";
import * as HttpStatusCodes from "~/constants/http-status-codes";
import { SESSION_ADMIN_PREFIX, type SessionValue } from "~/constants/session";
import { initConfigs } from "~/modules/admin/config/configs.default";

const TOKEN_TTL = Number(process.env.TOKEN_TTL) || 86400;

function buildSessionValue(c: Context): SessionValue {
  return {
    role: "admin" as const,
    loginIp: c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown",
    userAgent: c.req.header("user-agent") || "unknown",
    createdAt: Date.now(),
    lastActiveAt: Date.now(),
  };
}

async function createSession(c: Context) {
  const token = generateToken();
  const value = buildSessionValue(c);
  await redis.setex(`${SESSION_ADMIN_PREFIX}${token}`, TOKEN_TTL, JSON.stringify(value));
  return token;
}

function setCookie(c: Context, token: string) {
  c.header(
    "set-cookie",
    `token=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${TOKEN_TTL}`,
  );
}

export async function status(c: Context) {
  const result = db.select({ count: count() }).from(passwords).get();
  return c.json(ok({ initialized: result!.count > 0 }, "状态检查成功"), HttpStatusCodes.OK);
}

// 设置系统密码
export async function setup(c: Context) {
  const result = db.select({ count: count() }).from(passwords).get();
  if (result!.count > 0) {
    return c.json(fail(ErrorCode.ALREADY_INITIALIZED, "已初始化"), HttpStatusCodes.CONFLICT);
  }

  const { password } = await c.req.json<{ password: string }>();

  const passwordHash = await hashPassword(password);
  db.insert(passwords).values({ hash: passwordHash }).run();

  const recoveryKey = generateToken();
  const recoveryHash = await hashPassword(recoveryKey);
  db.insert(recoveryKeys).values({ hash: recoveryHash }).run();

  // 初始化默认配置，如果此次是第一次设置密码，则说明之前没有配置过，直接初始化默认配置
  // 如果不是第一次设置密码，则说明之前初始化过，就不会再初始化默认配置了，避免覆盖之前的配置
  await initConfigs();

  const token = await createSession(c);
  setCookie(c, token);

  return c.json(ok({ recoveryKey }, "设置成功"), HttpStatusCodes.CREATED);
}

export async function login(c: Context) {
  const pw = db.select().from(passwords).limit(1).all()[0];
  if (!pw) {
    return c.json(fail(ErrorCode.NOT_INITIALIZED, "尚未初始化"), HttpStatusCodes.BAD_REQUEST);
  }

  const { password } = await c.req.json<{ password: string }>();
  const valid = await verifyPassword(password, pw.hash);
  if (!valid) {
    return c.json(fail(ErrorCode.INVALID_PASSWORD, "密码错误"), HttpStatusCodes.UNAUTHORIZED);
  }

  const token = await createSession(c);
  setCookie(c, token);

  return c.json(ok({}, "登录成功"), HttpStatusCodes.OK);
}

export async function recover(c: Context) {
  const { recoveryKey } = await c.req.json<{ recoveryKey: string }>();

  const rk = db.select().from(recoveryKeys).where(eq(recoveryKeys.isUsed, false)).limit(1).all()[0];
  if (!rk) {
    return c.json(fail(ErrorCode.NO_VALID_RECOVERY_KEY, "无有效恢复密钥"), HttpStatusCodes.BAD_REQUEST);
  }

  const valid = await verifyPassword(recoveryKey, rk.hash);
  if (!valid) {
    return c.json(fail(ErrorCode.INVALID_RECOVERY_KEY, "恢复密钥错误"), HttpStatusCodes.UNAUTHORIZED);
  }

  db.delete(passwords).run();
  db.update(recoveryKeys)
    .set({ isUsed: true })
    .where(eq(recoveryKeys.id, rk.id))
    .run();

  const newKey = generateToken();
  const newHash = await hashPassword(newKey);
  db.insert(recoveryKeys).values({ hash: newHash }).run();

  const keys = await redis.keys(`${SESSION_ADMIN_PREFIX}*`);
  if (keys.length > 0) {
    await redis.del(keys);
  }

  return c.json(ok({ newRecoveryKey: newKey }, "恢复成功"), HttpStatusCodes.OK);
}
