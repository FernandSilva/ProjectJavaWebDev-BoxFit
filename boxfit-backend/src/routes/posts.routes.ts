"use strict";
import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import * as Posts from "../controllers/posts.controller";
import { verifyToken } from "../middleware/verifyToken";

const router = Router();

// ───────────────────────────────
// Ensure uploads directory exists
// ───────────────────────────────
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// ───────────────────────────────
// Multer Configuration (Disk Storage)
// ───────────────────────────────
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
      const timestamp = Date.now();
      const safeName = file.originalname.replace(/\s+/g, "_");
      cb(null, `${timestamp}-${safeName}`);
    },
  }),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB
    files: 20,
  },
});

// ───────────────────────────────
// Async wrapper
// ───────────────────────────────
const wrap = (fn: any) => (req: any, res: any, next: any) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// ───────────────────────────────
// POSTS ROUTES
// ───────────────────────────────
router.get("/posts", wrap(Posts.listPosts));
router.get("/posts/recent", wrap(Posts.getRecentPosts));
router.get("/posts/:id", wrap(Posts.getPostById));
router.get("/posts/following/:userId", wrap(Posts.getFollowingPosts));
router.get("/posts/followers/:userId", wrap(Posts.getFollowersPosts));
router.get("/posts/user/:userId", wrap(Posts.getUserPosts));
router.get("/users/:userId/posts", wrap(Posts.getUserPosts)); // legacy alias

// 🆕 Protected creation + update + delete
router.post("/posts", verifyToken, upload.array("files", 20), wrap(Posts.createPost));
router.patch("/posts/:id", verifyToken, upload.array("files", 20), wrap(Posts.updatePost));
router.delete("/posts/:id", verifyToken, wrap(Posts.deletePost));

// ❤️ Like / Unlike Post – protected
router.post("/posts/:id/like", verifyToken, wrap(Posts.likePost));

// 💾 Save / Unsave Post – protected
router.post("/posts/:id/save", verifyToken, wrap(Posts.savePost));
router.delete("/posts/saved/:saveId", verifyToken, wrap(Posts.deleteSavedPost));
router.delete("/saves/:saveId", verifyToken, wrap(Posts.deleteSavedPost)); // legacy alias

console.log("✅ Posts routes registered successfully");
export default router;
