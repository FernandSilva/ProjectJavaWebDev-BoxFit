// src/routes/posts.routes.ts
import { Router } from "express";
import multer from "multer";
import * as Posts from "../controllers/posts.controller";

const router = Router();

// Multer memory storage with sensible file limits
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB per file
    files: 20,
  },
});

// Async wrapper to catch errors and forward to next middleware
const wrap =
  (fn: any) =>
  (req: any, res: any, next: any) =>
    Promise.resolve(fn(req, res, next)).catch(next);

/* ============================================================================
   POST ROUTES
============================================================================ */

// List/search/recent
router.get("/posts", wrap(Posts.listPosts));
router.get("/posts/recent", wrap(Posts.getRecentPosts));

// Single post
router.get("/posts/:id", wrap(Posts.getPostById));

// Feed (following & followers)
router.get("/posts/following/:userId", wrap(Posts.getFollowingPosts));
router.get("/posts/followers/:userId", wrap(Posts.getFollowersPosts));

// User-specific posts
router.get("/posts/user/:userId", wrap(Posts.getUserPosts));
router.get("/users/:userId/posts", wrap(Posts.getUserPosts)); // legacy alias

// Create post with files
router.post(
  "/posts",
  upload.fields([
    { name: "files", maxCount: 20 },
    { name: "file", maxCount: 20 },
  ]),
  wrap(Posts.createPost)
);

// Update post
router.patch(
  "/posts/:id",
  upload.fields([
    { name: "files", maxCount: 20 },
    { name: "file", maxCount: 20 },
  ]),
  wrap(Posts.updatePost)
);

// Delete post
router.delete("/posts/:id", wrap(Posts.deletePost));

// Like post
router.post("/posts/:id/like", wrap(Posts.likePost));

// Save post
router.post("/posts/:id/save", wrap(Posts.savePost));

// Delete saved post (new + legacy)
router.delete("/posts/saved/:saveId", wrap(Posts.deleteSavedPost)); // preferred
router.delete("/saves/:saveId", wrap(Posts.deleteSavedPost));       // legacy

export default router;

