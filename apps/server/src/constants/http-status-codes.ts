// 200 — 请求成功，返回数据
export const OK = 200;

// 201 — 资源创建成功
export const CREATED = 201;

// 400 — 请求格式/参数有误
export const BAD_REQUEST = 400;

// 401 — 未认证
export const UNAUTHORIZED = 401;

// 403 — 已认证 无权限访问
export const FORBIDDEN = 403;

// 404 — 资源不存在
export const NOT_FOUND = 404;

// 409 — 资源冲突（如用户名已存在）
export const CONFLICT = 409;

// 422 — 格式正确但内容不合法（如邮箱格式错）
export const UNPROCESSABLE_ENTITY = 422;

// 500 — 服务器内部错误
export const INTERNAL_SERVER_ERROR = 500;
