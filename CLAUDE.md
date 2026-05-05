# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概况

3qrain 博客后台，Turborepo monorepo，Bun 运行时。

```
apps/admin     — Vite 8 + Vue 3.5 前端 (port 5173)
apps/server    — Hono 4 后端 (port 3000)
packages/
  eslint-config  — 共享 ESLint 配置
```

## 常用命令

```bash
bun dev                  # turbo 并行启动前后端
bun dev --filter=admin   # 只前端
bun dev --filter=server  # 只后端
docker compose up -d     # 启动 MongoDB + Redis
docker compose stop      # 停止
```

## 技术栈

- **后端**: Hono 4 + Bun + Mongoose + Zod + @hono/zod-openapi + ioredis
- **前端**: Vite 8 + Vue 3.5 + Pinia + Vue Router
- **数据库**: MongoDB 8，Docker Compose 管理
- **缓存**: Redis (alpine)，Docker Compose 管理
- **认证**: 单 token + Redis session + Cookie (SameSite=Lax, HttpOnly)

## 后端目录结构

```
apps/server/src/
├── index.ts               # 入口：connectDB、注册中间件、挂载路由
├── db.ts                  # mongoose.connect + new Redis()
├── constants/
│   └── http-status-codes.ts  # HTTP 状态码常量
├── middleware/
│   ├── auth-guard.ts      # 认证中间件
│   └── error-handler.ts   # 全局错误处理
├── utils/
│   └── crypto.ts          # bcrypt 密码、随机 token
└── modules/
    └── auth/
        ├── auth.models.ts     # 原生 Mongoose Schema
        ├── auth.routes.ts     # createRoute 定义 + Zod schema（导出路由和 schema）
        ├── auth.handlers.ts   # 业务逻辑（导出 handler 函数）
        └── auth.index.ts      # OpenAPIHono 组装，export default
```

## 路径别名

后端使用 `~/` 映射 `src/`（tsconfig paths），跨目录 import 一律用别名：

```typescript
import { redis } from "~/db";
import * as HttpStatusCodes from "~/constants/http-status-codes";
```

模块内部使用相对路径：`./auth.models`、`./auth.handlers`。

## HTTP 状态码

统一从 `~/constants/http-status-codes` 引入，禁止裸数字：

```typescript
import * as HttpStatusCodes from "~/constants/http-status-codes";

c.json({ data }, HttpStatusCodes.OK);
c.json({ error: "..." }, HttpStatusCodes.UNAUTHORIZED);
```

可用：`OK` / `CREATED` / `BAD_REQUEST` / `UNAUTHORIZED` / `FORBIDDEN` / `NOT_FOUND` / `CONFLICT` / `UNPROCESSABLE_ENTITY` / `INTERNAL_SERVER_ERROR`

## 模块结构

每个模块四个文件，职责分离：

| 文件 | 职责 |
|---|---|
| `xxx.models.ts` | 原生 Mongoose Schema，`export const XxxModel` |
| `xxx.routes.ts` | `createRoute()` 定义 + Zod schema，按名导出 |
| `xxx.handlers.ts` | `export async function` 处理函数 |
| `xxx.index.ts` | `new OpenAPIHono()` 组装 routes + handlers，`export default` |

## 导入规范

routes 和 handlers 统一用命名空间导入：

```typescript
import * as handlers from "./auth.handlers";
import * as routes from "./auth.routes";

auth.openapi(routes.statusRoute, handlers.status);
```

## 数据模型

使用原生 Mongoose Schema，不用 typegoose：

```typescript
const schema = new mongoose.Schema(
  { field: { type: String, required: true } },
  { timestamps: true }  // 自动 createdAt / updatedAt
);
```

## 认证流程

单账号系统，密码登录，token 存 Redis + cookie：

- `GET /api/auth/status` — 检查是否初始化（`{ initialized: boolean }`）
- `POST /api/auth/setup` — 首次设置密码（201 / 409）
- `POST /api/auth/login` — 登录（200 / 400 / 401）
- `POST /api/auth/change-password` — 修改密码（需认证）
- `POST /api/auth/recover` — 恢复密钥重置（200 / 400 / 401）
- `POST /api/auth/logout` — 退出（需认证）

Token 为随机 32 字节 hex，Redis key `session:<token>`，TTL 由 `TOKEN_TTL` 环境变量控制（默认 86400），每次请求自动刷新。Cookie：`token=<token>; HttpOnly; SameSite=Lax; Path=/; Max-Age=<TTL>`。

## 环境变量

```
MONGODB_URI=mongodb://localhost:27017/3qrain
REDIS_URL=redis://localhost:6379
TOKEN_TTL=86400
ADMIN_RECOVERY_KEY=<32~64位随机字符串>
```

## 注意事项

- 不要使用 `node:crypto`，用 Web Crypto API（`crypto.getRandomValues`）或 `Bun.password`
- 数据库 UTC 存储，Docker 容器 TZ=Asia/Shanghai
- 安装依赖务必 `cd` 到对应 app 目录，不要在根目录误装
