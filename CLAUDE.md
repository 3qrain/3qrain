# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概况

3qrain 博客后台，Turborepo monorepo，Bun 运行时。

```
apps/admin     — Vite 8 + Vue 3.5 前端 (port 5173)
apps/server    — Hono 4 后端 (port 3000)
packages/
  shared         — @3qrain/shared，共享常量 (ErrorCode)
  eslint-config  — @repo/eslint-config，共享 ESLint
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

- **后端**: Hono 4 + Bun + Mongoose + @hono/zod-openapi + bcryptjs + ioredis
- **前端**: Vite 8 + Vue 3.5 + Pinia + Vue Router
- **数据库**: MongoDB 9 + Mongoose，Docker Compose 管理
- **缓存**: Redis (alpine)，Docker Compose 管理
- **认证**: 单 token (random hex 32B) + Redis session + Cookie (SameSite=Lax, HttpOnly)
- **共享包**: `@3qrain/shared` — ErrorCode 常量（前后端公用）

## 后端目录结构

```
apps/server/src/
├── index.ts                     # 入口：connectDB、createApp、挂载路由
├── db.ts                        # mongoose + redis 连接及事件日志
├── constants/
│   └── http-status-codes.ts     # HTTP 状态码常量 (OK, CREATED, BAD_REQUEST...)
├── lib/
│   └── core/
│       └── create-app.ts        # createApp() 工厂，内置 Zod defaultHook
├── middleware/
│   ├── auth-guard.ts            # 认证中间件（读 cookie → redis 校验 → 刷新 TTL）
│   └── error-handler.ts         # 全局 onError（兜底 500）
├── utils/
│   ├── crypto.ts                # bcryptjs 密码哈希 + generateToken
│   └── response.ts              # ok() / fail() 响应辅助 + Zod schema
└── modules/
    └── auth/
        ├── auth.models.ts       # 原生 Mongoose Schema (Password, RecoveryKey)
        ├── auth.routes.ts       # OpenAPI route 定义 + Zod request/response schema
        ├── auth.handlers.ts     # 业务逻辑
        └── auth.index.ts        # createApp() + openapi 注册
```

## 路径别名

后端 `~/` → `src/`，跨目录 import 一律用别名，模块内部用相对路径。

## HTTP 状态码

从 `~/constants/http-status-codes` 引入，禁止裸数字：
```typescript
import * as HttpStatusCodes from "~/constants/http-status-codes";
```

## 错误码

从 `@3qrain/shared` 引入：
```typescript
import { ErrorCode } from "@3qrain/shared";
// ErrorCode.INVALID_PASSWORD, ErrorCode.NOT_INITIALIZED, ...
```

## 响应规范

统一格式，通过 `~/utils/response` 的 `ok()` / `fail()` 构建：
```typescript
ok(data, "消息")    // { success: true,  code: "OK", message: "...", data }
fail(ErrorCode.X, "消息")  // { success: false, code: "X", message: "..." }
```

## 模块结构

每个模块四个文件：`models.ts` / `routes.ts` / `handlers.ts` / `index.ts`

- `index.ts` 用 `createApp()` 创建实例，注册 `openapi(route, handler)`
- routes 和 handlers 用命名空间导入：`import * as routes from "./xxx.routes"`

## OpenAPIHono 实例

必须通过 `createApp()` 创建，它内置了 Zod 校验 defaultHook：
```typescript
import { createApp } from "~/lib/core/create-app";
const app = createApp();
```

## 数据模型

原生 Mongoose Schema + `{ timestamps: true }`。不用 typegoose。

## 环境变量

```
MONGODB_URI=mongodb://localhost:27017/3qrain
REDIS_URL=redis://localhost:6379
TOKEN_TTL=86400
```

## Docker

- MongoDB 8:27017，Redis alpine:6379
- TZ=Asia/Shanghai，数据库存 UTC
- Volume 命名: 3qrain-mongo-data / 3qrain-redis-data

## 注意事项

- 不用 `node:crypto`，用 Web Crypto API 或 `bcryptjs`
- 安装依赖务必 `cd` 到对应 app 目录
- 每个 OpenAPIHono 实例都用 `createApp()` 创建
- 状态码、错误码全部用常量，不写裸数字/字符串
