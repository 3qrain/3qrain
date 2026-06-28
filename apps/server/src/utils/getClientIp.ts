import type { Context } from 'hono'

export function getClientIp(c: Context) {
  const xff = c.req.header("x-forwarded-for")
  const realIp = c.req.header("x-real-ip")

  let ip =
    xff?.split(",")[0]?.trim() ||
    realIp ||
    "unknown"

  // 处理 IPv4-mapped IPv6
  if (ip.startsWith("::ffff:")) {
    ip = ip.replace("::ffff:", "")
  }

  return ip
}