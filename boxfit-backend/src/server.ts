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

console.log("===========================================================");
console.log("🚀 Starting BoxFit Backend...");
console.log("🕓 Timestamp:", new Date().toISOString());
console.log("Working directory:", process.cwd());
console.log("===========================================================");

// ----------------------
// Load environment
// ----------------------
const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST || "0.0.0.0";
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017";
const MONGO_DB_NAME = process.env.MONGO_DB_NAME || "BoxFit";

console.log("🛠 Config:", { PORT, HOST, CORS_ORIGIN, MONGO_URI, MONGO_DB_NAME });

// ----------------------
// Express setup
// ----------------------
const app = express();
app.use(helmet());
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(morgan("dev"));
console.log("✅ Middleware initialized");

// ----------------------
// Dynamic Router Import Verification
// ----------------------
const routesPath = path.join(process.cwd(), "src", "routes");
console.log("🔍 Checking routes directory:", routesPath);

if (!fs.existsSync(routesPath)) {
  console.error("❌ ERROR: Routes directory not found at:", routesPath);
} else {
  console.log("📁 Routes directory contents:", fs.readdirSync(routesPath));
}

// ----------------------
// Import Routers (with logging)
// ----------------------
function safeImportRouter(name: string, importPath: string) {
  try {
    const router = require(importPath).default;
    if (!router) {
      console.warn(`⚠️ Router '${name}' has no default export:`, importPath);
    } else {
      console.log(`✅ Loaded router '${name}' from:`, importPath);
    }
    return router;
  } catch (err: any) {
    console.error(`❌ Failed to import router '${name}' from ${importPath}:`, err.message);
    return null;
  }
}

const authRouter = safeImportRouter("auth", path.join(routesPath, "auth.routes"));
const usersRouter = safeImportRouter("users", path.join(routesPath, "users.routes"));
const postsRouter = safeImportRouter("posts", path.join(routesPath, "posts.routes"));
const notificationsRouter = safeImportRouter("notifications", path.join(routesPath, "notifications.routes"));

console.log("🧭 Mounting routers...");
if (authRouter) app.use("/api", authRouter);
if (usersRouter) app.use("/api", usersRouter);
if (postsRouter) app.use("/api", postsRouter);
if (notificationsRouter) app.use("/api", notificationsRouter);
console.log("✅ Routers mounted successfully");

// ----------------------
// Endpoint Listing
// ----------------------
const endpoints = listEndpoints(app);
console.log("📜 Registered endpoints:");
if (endpoints.length === 0) {
  console.warn("⚠️ No endpoints registered. Check router import paths!");
} else {
  console.table(endpoints.map(r => ({ methods: r.methods.join(","), path: r.path })));
}

// ----------------------
// Health check
// ----------------------
app.get("/api/healthz", (_req, res) => res.status(200).json({ ok: true }));

// ----------------------
// 404 Fallback
// ----------------------
app.use("/api", (req, res) => {
  console.log(`🚫 404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: "Not found", path: req.originalUrl });
});

// ----------------------
// Error Handler
// ----------------------
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  console.error("❌ Unhandled Error:", err);
  res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});

// ----------------------
// MongoDB + Server startup
// ----------------------
(async () => {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI, { dbName: MONGO_DB_NAME });
    console.log("✅ MongoDB connected successfully");

    app.listen(PORT, HOST, () => {
      console.log("🚀 Server running:");
      console.table({ host: HOST, port: PORT, cors: CORS_ORIGIN });
    });
  } catch (err: any) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
})();
