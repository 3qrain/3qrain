import type { ErrorHandler } from "hono";
import { fail } from "~/utils/response";
import { ErrorCode } from "@3qrain/shared";
import * as HttpStatusCodes from "~/constants/http-status-codes";

export const errorHandler: ErrorHandler = (err, c) => {  
  console.log(err);
  if ("status" in err && err.status === 400) {
    return c.json(
      fail(ErrorCode.INVALID_PARAMS, "参数错误"),
      HttpStatusCodes.BAD_REQUEST,
    )
  }
  return c.json( 
    fail(ErrorCode.INTERNAL_ERROR, "服务器错误"),
    HttpStatusCodes.INTERNAL_SERVER_ERROR,
  );
};
