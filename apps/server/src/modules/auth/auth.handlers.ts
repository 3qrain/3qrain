import type { Context } from "hono";
import { redis } from "~/db";
import { hashPassword, verifyPassword, generateToken } from "~/utils/crypto";
import { ok, fail } from "~/utils/response";
import { PasswordModel, RecoveryKeyModel } from "./auth.models";
import * as HttpStatusCodes from "~/constants/http-status-codes";
import { ErrorCode } from "@3qrain/shared";
import { SESSION_ADMIN_PREFIX, type SessionValue } from "~/constants/session";

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
  const count = await PasswordModel.countDocuments();
  return c.json(ok({ initialized: count > 0 }, "状态检查成功"), HttpStatusCodes.OK);
}

export async function setup(c: Context) {
  const count = await PasswordModel.countDocuments();
  if (count > 0) {
    return c.json(fail(ErrorCode.ALREADY_INITIALIZED, "已初始化"), HttpStatusCodes.CONFLICT);
  }

  const { password } = await c.req.json<{ password: string }>();

  const passwordHash = await hashPassword(password);
  await PasswordModel.create({ hash: passwordHash });

  const recoveryKey = generateToken();
  const recoveryHash = await hashPassword(recoveryKey);
  await RecoveryKeyModel.create({ hash: recoveryHash });

  const token = await createSession(c);
  setCookie(c, token);

  return c.json(ok({ recoveryKey }, "设置成功"), HttpStatusCodes.CREATED);
}

export async function login(c: Context) {
  const pw = await PasswordModel.findOne();
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

  const rk = await RecoveryKeyModel.findOne({ isUsed: false });
  if (!rk) {
    return c.json(fail(ErrorCode.NO_VALID_RECOVERY_KEY, "无有效恢复密钥"), HttpStatusCodes.BAD_REQUEST);
  }

  const valid = await verifyPassword(recoveryKey, rk.hash);
  if (!valid) {
    return c.json(fail(ErrorCode.INVALID_RECOVERY_KEY, "恢复密钥错误"), HttpStatusCodes.UNAUTHORIZED);
  }

  await PasswordModel.deleteMany({});
  rk.isUsed = true;
  await rk.save();

  const newKey = generateToken();
  const newHash = await hashPassword(newKey);
  await RecoveryKeyModel.create({ hash: newHash });

  const keys = await redis.keys(`${SESSION_ADMIN_PREFIX}*`);
  if (keys.length > 0) {
    await redis.del(keys);
  }

  return c.json(ok({ newRecoveryKey: newKey }, "恢复成功"), HttpStatusCodes.OK);
}
