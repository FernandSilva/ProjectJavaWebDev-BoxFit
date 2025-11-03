import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import * as Posts from "../controllers/posts.controller";

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
const wrap =
  (fn: any) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// ───────────────────────────────
// POSTS ROUTES
// ───────────────────────────────

// 🧭 All posts (list + optional search)
router.get("/posts", wrap(Posts.listPosts));

// 🕐 Recent posts
router.get("/posts/recent", wrap(Posts.getRecentPosts));

// 🧾 Get single post by ID
router.get("/posts/:id", wrap(Posts.getPostById));

// 🧑‍🤝‍🧑 Feeds
router.get("/posts/following/:userId", wrap(Posts.getFollowingPosts));
router.get("/posts/followers/:userId", wrap(Posts.getFollowersPosts));

// 👤 User posts (both paths supported)
router.get("/posts/user/:userId", wrap(Posts.getUserPosts));
router.get("/users/:userId/posts", wrap(Posts.getUserPosts)); // legacy alias

// 🆕 Create + Update  ✅ uses Multer for multipart/form-data
router.post("/posts", upload.array("files", 20), wrap(Posts.createPost));
router.patch("/posts/:id", upload.array("files", 20), wrap(Posts.updatePost));

// ❌ Delete post
router.delete("/posts/:id", wrap(Posts.deletePost));

// ❤️ Like / Unlike Post
router.post("/posts/:id/like", wrap(Posts.likePost));

// 💾 Save / Unsave Post
router.post("/posts/:id/save", wrap(Posts.savePost));
router.delete("/posts/saved/:saveId", wrap(Posts.deleteSavedPost));
// legacy alias for unsave by id
router.delete("/saves/:saveId", wrap(Posts.deleteSavedPost));

console.log("✅ Posts routes registered successfully");

export default router;
