// src/server.ts
import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import { randomUUID } from "node:crypto";
import { MulterError } from "multer";
// Appwrite exception class is optional; guard by name as well.
import { AppwriteException } from "node-appwrite";

import logger from "./logger";
import { checkAppwrite } from "./lib/appwriteClient";

import usersRouter from "./routes/users.routes";
import postsRouter from "./routes/posts.routes";
import notificationsRouter from "./routes/notifications.routes";
import commentsRouter from "./routes/comments.routes";
import messagesRouter from "./routes/messages.routes";
import contactRequestsRouter from "./routes/contactRequests.routes";
import filesRouter from "./routes/files.routes";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST || "0.0.0.0";
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";
const CRASH_ON_UNCAUGHT =
  (process.env.CRASH_ON_UNCAUGHT || "").toLowerCase() === "true";

const app = express();
app.disable("x-powered-by");

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
app.use(
  pinoHttp({
    logger,
    genReqId: (_req, res) => {
      const id = randomUUID();
      res.setHeader("X-Request-Id", id);
      return id;
    },
    serializers: {
      req(req) {
        return {
          id: (req as any).id,
          method: req.method,
          url: req.url,
          ip: req.ip,
          // body: (req as any).raw?.body, // uncomment only for deep debugging
        };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
      err(err: any) {
        return {
          type: err?.name,
          message: err?.message,
          stack: err?.stack,
        };
      },
    },
  })
);

app.use(helmet());
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
app.get("/api/healthz", (_req, res) => res.status(200).json({ ok: true }));

// Mount feature routers BEFORE the 404 handler
app.use("/api", usersRouter);
app.use("/api", postsRouter);
app.use("/api", commentsRouter);
app.use("/api", notificationsRouter);
app.use("/api/messages", messagesRouter);
app.use("/api", contactRequestsRouter);
app.use("/api", filesRouter);

// 404 for /api/*
app.use("/api", (_req, res) => res.status(404).json({ error: "Not found" }));
app.use((_req, res) => res.status(404).json({ error: "Not found" }));

// ---------------------------------------------------------------------------
// Centralized error handler (covers Multer, JSON parse, Appwrite, etc.)
// ---------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  const reqId = (req as any).id || res.getHeader("X-Request-Id");

  // Helper to reply consistently
  const reply = (status: number, message: string, extra?: Record<string, any>) => {
    (req as any).log?.error({ msg: "unhandled.error", status, message, err, reqId });
    return res.status(status).json({ error: message, requestId: reqId, ...(extra || {}) });
  };

  // 1) Multer errors (e.g., "Unexpected field", file size limits, wrong field name)
  if (err instanceof MulterError || err?.name === "MulterError") {
    // Common Multer error codes:
    // LIMIT_PART_COUNT, LIMIT_FILE_SIZE, LIMIT_FILE_COUNT, LIMIT_FIELD_KEY,
    // LIMIT_FIELD_VALUE, LIMIT_FIELD_COUNT, LIMIT_UNEXPECTED_FILE
    switch (err.code) {
      case "LIMIT_FILE_SIZE":
        return reply(400, "Uploaded file is too large.");
      case "LIMIT_FILE_COUNT":
        return reply(400, "Too many files uploaded.");
      case "LIMIT_UNEXPECTED_FILE":
        // Clarify accepted field names for our app
        return reply(400, "Unexpected file field. Use 'files' (array) or 'file' (single).", {
          field: err.field,
        });
      default:
        return reply(400, `Upload error: ${err.message}`, { code: err.code });
    }
  }

  // 2) Body parser / JSON errors
  // body-parser sets: err.type === 'entity.parse.failed' for bad JSON
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

  // 3) Appwrite exceptions
  if (err instanceof AppwriteException || err?.name === "AppwriteException") {
    const status = Number(err?.code) || 500;
    return reply(status, err?.message || "Appwrite error");
  }

  // 4) Default
  const status = Number(err?.status) || 500;
  return reply(status, err?.message || "Internal Server Error");
});

// ---------------------------------------------------------------------------
// Start server + non-fatal Appwrite connectivity check
// ---------------------------------------------------------------------------
const server = app.listen(PORT, HOST, () => {
  logger.info({ msg: "API listening", host: HOST, port: PORT, cors: CORS_ORIGIN });
});

server.on("listening", async () => {
  try {
    const ok = await checkAppwrite();
    if (!ok) {
      logger.warn({
        msg: "Appwrite connectivity/permissions check failed. Server still running.",
      });
    }
  } catch (e: any) {
    logger.warn({
      msg: "Appwrite connectivity probe threw.",
      error: e?.message || String(e),
    });
  }
});

// ---------------------------------------------------------------------------
// Process-level guards
// ---------------------------------------------------------------------------
process.on("unhandledRejection", (err: any) => {
  logger.error({ msg: "unhandledRejection", err });
  if (CRASH_ON_UNCAUGHT) process.exit(1);
});

process.on("uncaughtException", (err: any) => {
  logger.error({ msg: "uncaughtException", err });
  if (CRASH_ON_UNCAUGHT) process.exit(1);
});
