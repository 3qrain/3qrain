export const ErrorCode = {
  /** 密码错误 */
  INVALID_PASSWORD: "AUTH_INVALID_PASSWORD",
  /** 尚未初始化 */
  NOT_INITIALIZED: "AUTH_NOT_INITIALIZED",
  /** 已完成初始化 */
  ALREADY_INITIALIZED: "AUTH_ALREADY_INITIALIZED",
  /** 未登录 */
  UNAUTHORIZED: "AUTH_UNAUTHORIZED",
  /** Token 过期 */
  TOKEN_EXPIRED: "AUTH_TOKEN_EXPIRED",
  /** 无有效恢复密钥 */
  NO_VALID_RECOVERY_KEY: "AUTH_NO_VALID_RECOVERY_KEY",
  /** 恢复密钥错误 */
  INVALID_RECOVERY_KEY: "AUTH_INVALID_RECOVERY_KEY",
  /** 请求参数校验失败 */
  INVALID_PARAMS: "INVALID_PARAMS",
  /** 服务器内部错误 */
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode];
