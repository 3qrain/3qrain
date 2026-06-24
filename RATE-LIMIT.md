# 限流备忘

## 高优先级

| 接口 | 限流策略 | 原因 |
|------|----------|------|
| `POST /api/view` | IP + visitorId，30min 窗口内同内容同访客拒绝 | 刷浏览量 |
| `POST /api/auth/login` | IP 频控，5 次/分钟，封 15min | 暴力破解 |
| `POST /api/auth/recover` | IP 频控，3 次/10分钟 | 暴力枚举恢复密钥 |

## 中优先级

| 接口 | 限流策略 | 原因 |
|------|----------|------|
| `POST /api/auth/setup` | 仅未初始化时可调用，IP 频控 10 次/小时 | 恶意重置 |
| `POST /api/admin/upload/*` | 单 IP 并发连接数限制 + 文件大小校验 | 磁盘/带宽滥用 |
| `POST /api/admin/posts` | 单 IP 10 次/分钟 | 批量灌水 |
| `POST /api/admin/notes` | 单 IP 20 次/分钟 | 批量灌水 |

## 低优先级

| 接口 | 限流策略 | 原因 |
|------|----------|------|
| `GET /api/posts` | 单 IP 60 次/分钟 | 爬虫/高频抓取 |
| `GET /api/notes` | 单 IP 60 次/分钟 | 同上 |
| `GET /api/view/count` | 单 IP 30 次/分钟 | 恶意轮询 |

## 实现方案

Hono 无内置限流中间件，可选项：

1. **简单方案** — `hono-rate-limiter` + Redis store，按 IP 计数，配置灵活
2. **极简方案** — 手写 middleware，Redis `INCR` + `EXPIRE`，几十行

建议用方案 1，成熟稳定，支持滑动窗口/固定窗口/令牌桶多种策略。
