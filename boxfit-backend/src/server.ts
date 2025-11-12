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
import listEndpoints from "express-list-endpoints";

console.log("===========================================================");
console.log("🚀 Starting BoxFit Backend...");
console.log("🕓 Timestamp:", new Date().toISOString());
console.log("Working directory:", process.cwd());
console.log("===========================================================");

// ───────────────────────────────
// CONFIG
// ───────────────────────────────
const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST || "0.0.0.0";
const CORS_ORIGIN =
  process.env.CORS_ORIGIN ||
  "http://localhost:5173,https://projectjavawebdev-boxfit.onrender.com,https://projectjavawebdev-boxfit-1.onrender.com";
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017";
const MONGO_DB_NAME = process.env.MONGO_DB_NAME || "BoxFit";
const BACKEND_URL =
  process.env.BACKEND_URL || `https://projectjavawebdev-boxfit.onrender.com`;

console.log("🛠 Config:", {
  PORT,
  HOST,
  CORS_ORIGIN,
  BACKEND_URL,
  MONGO_URI,
  MONGO_DB_NAME,
});

const app = express();
app.set("trust proxy", 1);

// ───────────────────────────────
// SECURITY + LOGGING
// ───────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
  })
);

// ───────────────────────────────
// DYNAMIC CORS (Handles Render + Local)
// ───────────────────────────────
const allowedOrigins = new Set(
  (CORS_ORIGIN || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean)
);

const corsOptions: cors.CorsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.has(origin)) return cb(null, true);
    console.warn(`🚫 Blocked by CORS: ${origin}`);
    return cb(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(morgan("dev"));

// ───────────────────────────────
// BODY PARSING
// ───────────────────────────────
app.use((req, res, next) => {
  const type = (req.headers["content-type"] as string) || "";
  if (type.startsWith("multipart/form-data")) return next();
  express.json({ limit: "10mb" })(req, res, next);
});
app.use(express.urlencoded({ extended: true }));

// ───────────────────────────────
// STATIC UPLOADS
// ───────────────────────────────
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

app.use(
  "/uploads",
  (req, res, next) => {
    const origin = req.headers.origin as string | undefined;
    if (origin && allowedOrigins.has(origin)) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header("Vary", "Origin");
      res.header("Access-Control-Allow-Credentials", "true");
    }
    res.header("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
  },
  express.static(uploadsDir, {
    setHeaders: (res) => {
      res.setHeader("Cache-Control", "public, max-age=3600");
    },
  })
);

console.log("📂 Serving uploads from:", `${BACKEND_URL}/uploads`);

// ───────────────────────────────
// ROUTER IMPORTS (Robust Loader)
// ───────────────────────────────
let routesPath = path.join(__dirname, "routes"); // ✅ Use dist/routes in production
if (!fs.existsSync(routesPath)) routesPath = path.join(__dirname, "../src/routes");

function safeImportRouter(name: string, basePath: string) {
  const importPaths = [`${basePath}.js`, `${basePath}.ts`, basePath];
  for (const p of importPaths) {
    if (!fs.existsSync(p)) continue;
    try {
      const mod = require(p);
      const router = mod?.default || mod;
      if (router && typeof router.use === "function" && Array.isArray(router.stack)) {
        console.log(`✅ Loaded router '${name}' from:`, p);
        return router;
      }
    } catch (err: any) {
      console.error(`❌ Failed to import router '${name}' from ${p}:`, err.message);
    }
  }
  console.warn(`⚠️ Router '${name}' not found at: ${basePath}`);
  return null;
}

// ───────────────────────────────
// ROUTE MOUNTING
// ───────────────────────────────
const authRouter = safeImportRouter("auth", path.join(routesPath, "auth.routes"));
const usersRouter = safeImportRouter("users", path.join(routesPath, "users.routes"));
const postsRouter = safeImportRouter("posts", path.join(routesPath, "posts.routes"));
const likesRouter = safeImportRouter("likes", path.join(routesPath, "likes.routes"));
const savesRouter = safeImportRouter("saves", path.join(routesPath, "saves.routes"));
const notificationsRouter = safeImportRouter("notifications", path.join(routesPath, "notifications.routes"));
const messagesRouter = safeImportRouter("messages", path.join(routesPath, "messages.routes"));
const commentsRouter = safeImportRouter("comments", path.join(routesPath, "comments.routes"));

[
  authRouter,
  usersRouter,
  postsRouter,
  likesRouter,
  savesRouter,
  notificationsRouter,
  messagesRouter,
  commentsRouter,
].forEach((r) => r && app.use("/api", r));

console.log("✅ Routers mounted (flat /api)");

// ───────────────────────────────
// HEALTH & DIAGNOSTICS
// ───────────────────────────────
app.get("/api/_endpoints", (_req, res) => res.json(listEndpoints(app)));
app.get("/api/healthz", (_req, res) =>
  res.status(200).json({ ok: true, backend: BACKEND_URL })
);

// ───────────────────────────────
// GLOBAL ERROR HANDLER
// ───────────────────────────────
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error("❌ Unhandled Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV !== "production" ? err.stack : undefined,
  });
});

// ───────────────────────────────
// DATABASE + SERVER BOOT
// ───────────────────────────────
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
        cors: [...allowedOrigins],
        backend_url: BACKEND_URL,
      });
      console.log(`📂 Serving uploads from: ${BACKEND_URL}/uploads`);
      console.log(`🔎 Inspect routes at: ${BACKEND_URL}/api/_endpoints`);
    });
  } catch (err: any) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
})();
