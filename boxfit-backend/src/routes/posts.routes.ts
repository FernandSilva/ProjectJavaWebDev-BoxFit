import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import * as Posts from "../controllers/posts.controller";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024, files: 20 },
});

// Async wrapper
const wrap =
  (fn: any) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);

/* ============================================================================
   POST ROUTES
============================================================================ */

// List/search/recent
router.get("/posts", wrap(Posts.listPosts));
router.get("/posts/recent", wrap(Posts.getRecentPosts));

// Single post
router.get("/posts/:id", wrap(Posts.getPostById));

// Feed
router.get("/posts/following/:userId", wrap(Posts.getFollowingPosts));
router.get("/posts/followers/:userId", wrap(Posts.getFollowersPosts));

// User-specific posts
router.get("/posts/user/:userId", wrap(Posts.getUserPosts));
router.get("/users/:userId/posts", wrap(Posts.getUserPosts)); // legacy alias

// Create / Update
router.post("/posts", upload.array("files", 20), wrap(Posts.createPost));
router.patch("/posts/:id", upload.array("files", 20), wrap(Posts.updatePost));

// Delete
router.delete("/posts/:id", wrap(Posts.deletePost));

// Like / Save
router.post("/posts/:id/like", wrap(Posts.likePost));
router.post("/posts/:id/save", wrap(Posts.savePost));
router.delete("/posts/saved/:saveId", wrap(Posts.deleteSavedPost));
router.delete("/saves/:saveId", wrap(Posts.deleteSavedPost)); // legacy

export default router;
