"use strict";
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";

console.log("===========================================================");
console.log("🚀 Starting BoxFit Backend...");
console.log("🕓 Timestamp:", new Date().toISOString());
console.log("Working directory:", process.cwd());
console.log("===========================================================");

// ─── ENV CONFIG ─────────────────────────────────────────────
const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST || "0.0.0.0";
const CORS_ORIGIN =
  process.env.CORS_ORIGIN ||
  "http://localhost:5173,https://projectjavawebdev-boxfit.onrender.com";
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017";
const MONGO_DB_NAME = process.env.MONGO_DB_NAME || "BoxFit";
const BACKEND_URL =
  process.env.BACKEND_URL || `http://localhost:${PORT}`;

console.log("🛠 Config:", {
  PORT,
  HOST,
  CORS_ORIGIN,
  BACKEND_URL,
  MONGO_URI,
  MONGO_DB_NAME,
});

const app = express();

// ─── MIDDLEWARE ─────────────────────────────────────────────
app.set("trust proxy", 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
  })
);

const allowedOrigins = CORS_ORIGIN.split(",").map((o) => o.trim());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(cookieParser());
app.use(morgan("dev"));

// Handle JSON and form-data payloads
app.use((req, res, next) => {
  const type = req.headers["content-type"] || "";
  if (type.startsWith("multipart/form-data")) return next();
  express.json({ limit: "10mb" })(req, res, next);
});
app.use(express.urlencoded({ extended: true }));

// ─── STATIC UPLOADS ─────────────────────────────────────────
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

app.use(
  "/uploads",
  (req, res, next) => {
    res.header("Access-Control-Allow-Origin", allowedOrigins.join(","));
    res.header("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
  },
  express.static(uploadsDir, {
    setHeaders: (res) => {
      res.setHeader("Cache-Control", "public, max-age=3600");
    },
  })
);

console.log("📂 Serving uploads from:", `${BACKEND_URL}/uploads`);

// ─── ROUTER IMPORTS ─────────────────────────────────────────
let routesPath = path.join(__dirname, "../src/routes");
if (!fs.existsSync(routesPath)) {
  routesPath = path.join(__dirname, "routes");
}

function safeImportRouter(name: string, importPath: string) {
  try {
    const router = require(importPath).default;
    if (!router) throw new Error("No default export found");
    console.log(`✅ Loaded router '${name}' from:`, importPath);
    return router;
  } catch (err: any) {
    console.error(`❌ Failed to import router '${name}':`, err.message);
    return null;
  }
}

// Load routers dynamically
const authRouter = safeImportRouter("auth", path.join(routesPath, "auth.routes"));
const usersRouter = safeImportRouter("users", path.join(routesPath, "users.routes"));
const postsRouter = safeImportRouter("posts", path.join(routesPath, "posts.routes"));
const likesRouter = safeImportRouter("likes", path.join(routesPath, "likes.routes"));
const savesRouter = safeImportRouter("saves", path.join(routesPath, "saves.routes"));
const notificationsRouter = safeImportRouter("notifications", path.join(routesPath, "notifications.routes"));
const messagesRouter = safeImportRouter("messages", path.join(routesPath, "messages.routes"));
const commentsRouter = safeImportRouter("comments", path.join(routesPath, "comments.routes"));

// ─── ROUTE MOUNTING (flat /api/* structure) ─────────────────
if (authRouter) app.use("/api", authRouter);
if (usersRouter) app.use("/api", usersRouter);
if (postsRouter) app.use("/api", postsRouter);
if (likesRouter) app.use("/api", likesRouter);
if (savesRouter) app.use("/api/saves", savesRouter);
if (notificationsRouter) app.use("/api/notifications", notificationsRouter);
if (messagesRouter) app.use("/api/messages", messagesRouter);
if (commentsRouter) app.use("/api/comments", commentsRouter);

console.log("✅ Routers mounted successfully");

// ─── HEALTH CHECK ───────────────────────────────────────────
app.get("/api/healthz", (_req, res) =>
  res.status(200).json({ ok: true, backend: BACKEND_URL })
);

// ─── GLOBAL ERROR HANDLER ───────────────────────────────────
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error("❌ Unhandled Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV !== "production" ? err.stack : undefined,
  });
});

// ─── DATABASE & SERVER BOOT ─────────────────────────────────
(async () => {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI, { dbName: MONGO_DB_NAME });
    console.log("✅ MongoDB connected successfully");

    app.listen(PORT, HOST, () => {
      console.log("🚀 Server running:");
      console.table({
        host: HOST,
        port: PORT,
        cors: allowedOrigins,
        backend_url: BACKEND_URL,
      });
      console.log(`📂 Serving uploads from: ${BACKEND_URL}/uploads`);
    });
  } catch (err: any) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
})();
