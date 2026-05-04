# 3qrain Admin

博客后台管理系统。

## 项目结构

```
apps/
├── admin/     # 前端 - Vite + Vue 3
└── server/    # 后端 - NestJS + Fastify + MongoDB (Mongoose)
packages/
├── eslint-config/       # 共享 ESLint 配置
└── typescript-config/   # 共享 TypeScript 配置
```

## 技术栈

- **Monorepo**: Turborepo + Bun
- **前端**: Vite 6 + Vue 3 + Pinia + Vue Router
- **后端**: NestJS 11 + Fastify + Mongoose
- **语言**: TypeScript 5.9

## 开发

```bash
bun install              # 安装依赖
bun dev                  # 启动所有应用
bun dev --filter=admin   # 只启动前端
bun dev --filter=server  # 只启动后端
bun build                # 构建所有应用
bun lint                 # 代码检查
```
