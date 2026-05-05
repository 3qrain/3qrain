import type { ErrorHandler } from "hono";
import { ZodError } from "zod";
import { fail } from "~/utils/response";
import { ErrorCode } from "@3qrain/shared";
import * as HttpStatusCodes from "~/constants/http-status-codes";

export const errorHandler: ErrorHandler = (err, c) => {
  return c.json(
    fail(ErrorCode.INTERNAL_ERROR, "服务器错误"),
    HttpStatusCodes.INTERNAL_SERVER_ERROR,
  );
};
