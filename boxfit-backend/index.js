// index.ts

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fileUpload from "express-fileupload";

// Load env variables
dotenv.config();

import authRoutes from "./routes/auth.routes.js";
import uploadsRoutes from "./routes/uploads.routes.js";
import userRoutes from "./routes/users.routes.js";
import postsRoutes from "./routes/posts.routes.js";
import commentsRoutes from "./routes/comments.routes.js";
import messagesRoutes from "./routes/messages.routes.js";
import savesRoutes from "./routes/saves.routes.js";
import likesRoutes from "./routes/likes.routes.js";
import followsRoutes from "./routes/follows.routes.js";
import notificationsRoutes from "./routes/notifications.routes.js";

// Initialize app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload()); // Enables multipart form data

// Route registration
app.use("/api/auth", authRoutes);
app.use("/api/uploads", uploadsRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/comments", commentsRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/saves", savesRoutes);
app.use("/api/likes", likesRoutes);
app.use("/api/follow", followsRoutes);
app.use("/api/notifications", notificationsRoutes);

// Root route
app.get("/", (_req, res) => {
  res.send("✅ BoxFit Backend is running!");
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Server live at: http://localhost:${PORT}`);
});
