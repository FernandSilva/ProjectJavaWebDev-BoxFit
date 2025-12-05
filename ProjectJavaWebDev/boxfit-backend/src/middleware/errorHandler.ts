// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from "express";
import { MulterError } from "multer";
import logger from "../logger";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const reqId = (req as any).id || res.getHeader("X-Request-Id");

  const reply = (status: number, message: string, extra?: Record<string, any>) => {
    logger.error({ msg: "unhandled.error", status, message, err, reqId });
    return res.status(status).json({
      error: message,
      requestId: reqId,
      ...(extra || {}),
    });
  };

  // Multer upload errors
  if (err instanceof MulterError || err?.name === "MulterError") {
    switch (err.code) {
      case "LIMIT_FILE_SIZE":
        return reply(400, "Uploaded file is too large.");
      case "LIMIT_FILE_COUNT":
        return reply(400, "Too many files uploaded.");
      case "LIMIT_UNEXPECTED_FILE":
        return reply(400, "Unexpected file field. Use 'files' or 'file'.", {
          field: err.field,
        });
      default:
        return reply(400, `Upload error: ${err.message}`, { code: err.code });
    }
  }

  // JSON parse errors
  if (
    err?.type === "entity.parse.failed" ||
    (err instanceof SyntaxError && "body" in err)
  ) {
    return reply(400, "Invalid JSON payload.");
  }

  // Payload too large
  if (err?.type === "entity.too.large" || err?.status === 413) {
    return reply(413, "Payload too large.");
  }

  // MongoDB/Mongoose errors
  if (err.name === "ValidationError") {
    return reply(400, "Validation failed", { details: err.errors });
  }
  if (err.name === "CastError") {
    return reply(400, "Invalid resource ID");
  }

  // Default
  const status = Number(err?.status) || 500;
  return reply(status, err?.message || "Internal Server Error");
}
