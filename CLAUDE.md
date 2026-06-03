# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概况

3qrain 博客后台，Turborepo monorepo，Bun 运行时。

```
apps/admin     — Vite 8 + Vue 3.5 前端 (port 5173)
apps/server    — Hono 4 后端 (port 3010)
packages/
  shared         — @3qrain/shared，共享常量 (ErrorCode)
  eslint-config  — @repo/eslint-config，共享 ESLint
```

## 常用命令

```bash
bun dev                  # turbo 并行启动前后端
bun dev --filter=admin   # 只前端
bun dev --filter=server  # 只后端
docker compose up -d     # 启动 Redis
docker compose stop      # 停止
bunx drizzle-kit push    # schema 变更后推送数据库
```

## 技术栈

- **后端**: Hono 4 + Bun + Drizzle ORM + @hono/zod-openapi + bcryptjs + ioredis
- **前端**: Vite 8 + Vue 3.5 + Pinia + Vue Router + axios + @lucide/vue
- **数据库**: SQLite (bun:sqlite 驱动) + Drizzle ORM，文件存储在 `apps/server/data/`
- **缓存**: Redis (alpine)，Docker Compose 管理
- **认证**: 单 token (random hex 32B) + Redis session + Cookie (SameSite=Lax, HttpOnly)
- **共享包**: `@3qrain/shared` — ErrorCode 常量（前后端公用）

## 后端目录结构

```
apps/server/src/
├── index.ts                     # 根：connectDB → createApp → 挂载三层路由
├── db.ts                        # SQLite + Drizzle + Redis 连接
├── db/
│   └── schema/                  # Drizzle schema 定义（drizzle-kit 递归读取）
│       ├── index.ts             # barrel export
│       ├── columns.helpers.ts   # 公共 timestamps (createdAt, updatedAt)
│       ├── relations.ts         # Drizzle relations 定义
│       ├── passwords.ts
│       ├── recovery-keys.ts
│       ├── categories.ts
│       ├── tags.ts
│       ├── posts.ts
│       └── post-tags.ts
├── constants/
│   ├── http-status-codes.ts     # HTTP 状态码常量 (OK, CREATED, BAD_REQUEST...)
│   └── session.ts               # SESSION_ADMIN_PREFIX + sessionValueSchema
├── lib/core/
│   └── create-app.ts            # createApp() 工厂，内置 Zod defaultHook
├── middleware/
│   ├── auth-guard.ts            # 认证中间件（cookie → redis JSON → Zod → c.set("admin")）
│   └── error-handler.ts         # 全局 onError（兜底 500）
├── utils/
│   ├── crypto.ts                # bcryptjs 密码哈希 + generateToken (Web Crypto)
│   └── response.ts              # ok() / fail() 响应辅助 + Zod schema + timestamp
└── modules/
    ├── auth/        # 公开：status / setup / login / recover
    ├── admin/       # 全鉴权
    │   ├── account/       # change-password / logout
    │   ├── categories/    # 分类 CRUD
    │   ├── tags/          # 标签 CRUD
    │   └── posts/         # 文章 CRUD
    └── public/      # 前台接口（占位）
```

## 后端架构要点

### 三层模块划分

```
/api/*        → public/  无鉴权
/api/auth/*   → auth/    无鉴权
/api/admin/*  → admin/   全鉴权，authGuard 挂在模块内部 admin.use("*", authGuard)
```

根 index.ts 只挂路由，不感知鉴权。

### 命名规范

- **Router 实例** (`export default`): `authRouter`, `adminRouter`, `accountRouter` — 已注册完成的应用
- **Route 定义** (`export const`): `loginRoute`, `statusRoute` — createRoute 返回值
- **Handler**: `export async function`
- 导入：`import * as routes from "./xxx.routes"` / `import * as handlers from "./xxx.handlers"`

### 响应规范

统一格式，所有响应含 `timestamp`：

```typescript
import { ok, fail } from "~/utils/response";
import { ErrorCode } from "@3qrain/shared";

ok(data, "消息")    // { success: true,  code: "OK", message: "...", timestamp: ..., data }
fail(ErrorCode.X, "消息")  // { success: false, code: "X", message: "...", timestamp: ... }
```

无数据时传空对象：`ok({}, "消息")`。

### Session 数据结构

Redis key: `3qrain:session:admin:<token>`，值存 JSON（Zod 校验）：

```json
{ "role": "admin", "loginIp": "...", "userAgent": "...", "createdAt": ..., "lastActiveAt": ... }
```

guard 每次请求刷新 `lastActiveAt`。改密码时清除 `session:admin:*` 全设备下线。

## 前端目录结构

```
apps/admin/src/
├── main.ts              # 挂载 + initTheme()
├── App.vue
├── api/                 # 按模块分文件夹
│   └── auth/
│       ├── index.ts
│       └── types.ts
├── lib/axios/index.ts   # axios 实例 (baseURL 读 VITE_API_BASE_URL)
├── router/
│   ├── index.ts
│   └── routes.ts        # menuRoutes (带 meta.icon) + routes
├── stores/index.ts
├── themes/
│   ├── light.css        # :root (daisyUI oklch)
│   ├── dark.css         # html.dark
│   └── index.ts         # getTheme / setTheme / initTheme (含跟随系统)
├── layouts/
│   ├── AppLayout.vue    # 侧边栏 + main，≤768px 抽屉
│   └── components/
│       └── AppSidebar.vue
└── views/
    ├── Login.vue
    └── Dashboard.vue
```

### 前端架构要点

- **路径别名**: `~/` → `src/`（tsconfig.app.json + vite.config.ts）
- **主题**: daisyUI 色彩体系 (oklch)，light/dark/system 三模式，`html.dark` class 切换
- **AppLayout**: 桌面端 fixed 侧边栏 (240px) + main (margin-left)，移动端 slide-up 抽屉
- **SFC 顺序**: `<script>` → `<template>` → `<style>`
- **Vite 代理**: `/api` → `http://localhost:3010`

## 路径别名

前后端统一 `~/` → `src/`，跨目录 import 用别名，模块内部用相对路径。

## 环境变量

```
# server
DATABASE_PATH=data/3qrain.db
REDIS_URL=redis://localhost:6379
TOKEN_TTL=86400

# admin
VITE_API_BASE_URL=/api
```

## Docker

- Redis alpine:6379，TZ=Asia/Shanghai
- Volume 命名: 3qrain-redis-data
- SQLite 为文件数据库，无需容器

## 注意事项

- **不用 `node:crypto`**，用 Web Crypto API 或 `bcryptjs`
- **安装依赖务必 `cd` 到对应 app 目录**
- **状态码**：`import * as HttpStatusCodes from "~/constants/http-status-codes"`，禁止裸数字
- **错误码**：`import { ErrorCode } from "@3qrain/shared"`，禁止裸字符串
- **OpenAPIHono** 必须用 `createApp()` 创建
- **Vue 组件** script 写在 template 上面
- **前端 api 调用** 按模块建文件夹（`api/auth/`），axios 实例在 `lib/axios/`
- **Drizzle schema 变更**后跑 `bunx drizzle-kit push`，`casing: "snake_case"` 在 `drizzle.config.ts` 和 `db.ts` 两处维护
- **时间列**：`timestamp_ms` 毫秒模式 + `default(sql\`(unixepoch() * 1000)\`)`，updatedAt 用 `$onUpdate(() => new Date())`
- **better-sqlite3** 仅 devDeps，供 drizzle-kit CLI 用，运行时走 `bun:sqlite`
- **Handler 校验**：用 Zod schema `.strict().safeParse()`，拒绝多余字段，`const { tagIds, ...data } = parsed.data` 再 spread 到 Drizzle
- **文章 draft**：slug/categoryId 可空，发布/归档时校验必填，status 含 draft/published/archived
- **前端组件**：views 模块化（`views/posts/` 含 `components/editor/`），通用组件放 `components/table/` 等
- **分页**：`components/table/Pagination.vue`，mode=button 按钮分页 / scroll 滚动加载，切换mode需 watch 重建 Observer
- **Cookie**：`3qrain_token`，正则 `/3qrain_token=([^;]+)/`
- **端口**：后端 3010，前端 Vite 代理指向 3010
- **example 目录**：参考项目组件库，已 gitignore，CLAUDE EXAMPLE.md 有总结
