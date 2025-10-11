// src/server.ts
import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import mongoose from "mongoose";
import listEndpoints from "express-list-endpoints";
import path from "path";
import fs from "fs";

// Explicitly keep this static import (as before)
import commentsRoutes from "./routes/comments.routes";

console.log("===========================================================");
console.log("🚀 Starting BoxFit Backend...");
console.log("🕓 Timestamp:", new Date().toISOString());
console.log("Working directory:", process.cwd());
console.log("===========================================================");

const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST || "0.0.0.0";
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017";
const MONGO_DB_NAME = process.env.MONGO_DB_NAME || "BoxFit";

console.log("🛠 Config:", { PORT, HOST, CORS_ORIGIN, MONGO_URI, MONGO_DB_NAME });

const app = express();

// ────────────────────────────────
//  Security and Middleware
// ────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
  })
);
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(morgan("dev"));

app.use((req, res, next) => {
  const type = req.headers["content-type"] || "";
  if (type.startsWith("multipart/form-data")) return next();
  express.json({ limit: "10mb" })(req, res, next);
});
app.use(express.urlencoded({ extended: true }));

// mount comments directly (static)
app.use("/api", commentsRoutes);
console.log("✅ Middleware initialized");

// ────────────────────────────────
// Static Uploads
// ────────────────────────────────
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use(
  "/uploads",
  (req, res, next) => {
    res.header("Access-Control-Allow-Origin", CORS_ORIGIN);
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
console.log("📂 Serving uploads from:", `http://localhost:${PORT}/uploads`);



// ────────────────────────────────
// Dynamic Router Import Helper
// ────────────────────────────────
const routesPath = path.join(process.cwd(), "src", "routes");
console.log("🔍 Checking routes directory:", routesPath);

if (!fs.existsSync(routesPath)) {
  console.error("❌ Routes directory not found:", routesPath);
} else {
  console.log("📁 Routes directory contents:", fs.readdirSync(routesPath));
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

// ────────────────────────────────
// Load Routers
// ────────────────────────────────
const authRouter = safeImportRouter("auth", path.join(routesPath, "auth.routes"));
const usersRouter = safeImportRouter("users", path.join(routesPath, "users.routes"));
const postsRouter = safeImportRouter("posts", path.join(routesPath, "posts.routes"));
const likesRouter = safeImportRouter("likes", path.join(routesPath, "likes.routes"));
const savesRouter = safeImportRouter("saves", path.join(routesPath, "saves.routes"));
const notificationsRouter = safeImportRouter("notifications", path.join(routesPath, "notifications.routes"));
const messagesRouter = safeImportRouter("messages", path.join(routesPath, "messages.routes")); // ✅ Added here

console.log("🧭 Mounting routers...");
if (authRouter) app.use("/api", authRouter);
if (usersRouter) app.use("/api", usersRouter);
if (postsRouter) app.use("/api", postsRouter);
if (likesRouter) app.use("/api", likesRouter);
if (savesRouter) app.use("/api/saves", savesRouter);
if (notificationsRouter) app.use("/api/notifications", notificationsRouter);
if (messagesRouter) app.use("/api/messages", messagesRouter); // ✅ Added here
console.log("✅ Routers mounted successfully");


// ────────────────────────────────
// Endpoint Listing
// ────────────────────────────────
const endpoints = listEndpoints(app);
if (!endpoints.length) {
  console.warn("⚠️ No endpoints registered. Check router imports!");
} else {
  console.table(endpoints.map((r) => ({ methods: r.methods.join(","), path: r.path })));
}

// ────────────────────────────────
// Healthcheck + Fallback
// ────────────────────────────────
app.get("/api/healthz", (_req, res) => res.status(200).json({ ok: true }));

app.use("/api", (req, res) => {
  console.warn(`🚫 404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: "Not found", path: req.originalUrl });
});

// ────────────────────────────────
// Global Error Handler
// ────────────────────────────────
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("❌ Unhandled Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV !== "production" ? err.stack : undefined,
  });
});

// ────────────────────────────────
// MongoDB + Server Boot
// ────────────────────────────────
(async () => {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI, { dbName: MONGO_DB_NAME });
    console.log("✅ MongoDB connected successfully");

    app.listen(PORT, HOST, () => {
      console.log("🚀 Server running:");
      console.table({ host: HOST, port: PORT, cors: CORS_ORIGIN });
      console.log(`📂 Serving uploads from: http://localhost:${PORT}/uploads`);
    });
  } catch (err: any) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
})();
