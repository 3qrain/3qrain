import type { ErrorHandler } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { fail } from '~/utils/response'
import { ErrorCode } from '@3qrain/shared'

export const errorHandler: ErrorHandler = async (err, c) => {
  if (err instanceof HTTPException) {
    // csrf origin校验失败
    if (err.status === 403) {
      return c.text('FORBIDDEN', 403)
    }

    return c.text(err.message, err.status)
  }

  // console.log(err)
  // zod参数校验错误（Zod / 自定义）
  if ('status' in err && err.status === 400) {
    return c.json(fail(ErrorCode.INVALID_PARAMS, '参数错误'), 400)
  }

  return c.json(fail(ErrorCode.INTERNAL_ERROR, '[服务器异常] ' + err), 500)
}

const mapErrorCode = (status: number) => {
  switch (status) {
    case 401:
      return ErrorCode.UNAUTHORIZED
    case 403:
      return ErrorCode.UNAUTHORIZED
    case 404:
      return ErrorCode.POST_NOT_FOUND
    default:
      return ErrorCode.INTERNAL_ERROR
  }
}
