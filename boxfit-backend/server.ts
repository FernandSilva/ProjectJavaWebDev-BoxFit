// src/server.ts
import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import pino from "pino";
import pinoHttp from "pino-http";
import { randomUUID } from "node:crypto";

// Routers (RELATIVE paths!)
import postsRouter from "./src/routes/posts.routes";
import usersRouter from "./src/routes/users.routes";
import notificationsRouter from "./src/routes/notifications.routes";


import { checkAppwrite } from "./src/lib/appwriteClient";


// ---- logger
const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport:
    process.env.NODE_ENV === "production"
      ? undefined
      : { target: "pino-pretty", options: { translateTime: "SYS:standard", colorize: true } },
});

const app = express();

const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST || "0.0.0.0";
// Vite’s default dev server is 5173; keep it unless you’ve changed your FE port.
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

// ---- middleware
app.use(helmet());
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(
  pinoHttp({
    logger,
    genReqId: (req) => (req.headers["x-request-id"] as string) || randomUUID(),
    serializers: {
      req(req) {
        return { method: req.method, url: req.url };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  })
);

// ---- health check
app.get("/api/healthz", (_req, res) => res.status(200).json({ ok: true }));

// ---- feature routers
app.use("/api", usersRouter);
app.use("/api", postsRouter);
app.use("/api", notificationsRouter);

// ---- 404
app.use("/api", (_req, res) => res.status(404).json({ error: "Not found" }));

// ---- centralized error handler
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  req.log?.error({ err }, "Unhandled error");
  logger.error(err);
  res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});

// ---- optional: Appwrite connectivity self-check (only if you expose it)
(async () => {
  try {
    // Make sure this file actually exists with the exact name you use here:
    const { checkAppwrite } = await import("./src/lib/appwriteClient");
    if (typeof checkAppwrite === "function") {
      await checkAppwrite(logger);
    } else {
      logger.warn("checkAppwrite not found in appwriteClinet; skipping connectivity check.");
    }
  } catch (err) {
    logger.warn({ err }, "Appwrite connectivity check skipped/failed to import.");
  }
})();

process.on("unhandledRejection", (reason) => logger.error({ reason }, "unhandledRejection"));
process.on("uncaughtException", (err) => {
  logger.error({ err }, "uncaughtException");
  process.exit(1);
});

app.listen(PORT, HOST, () => {
  logger.info({ host: HOST, port: PORT, cors: CORS_ORIGIN }, "API listening");
});
