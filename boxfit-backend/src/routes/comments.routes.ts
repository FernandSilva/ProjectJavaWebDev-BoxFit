// src/routes/comments.routes.ts
import { Router, Request, Response, NextFunction } from "express";
import * as Comments from "../controllers/comments.controller";

const router = Router();

// Async wrapper
const wrap =
  (fn: any) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);

/* ============================================================================
   COMMENT ROUTES
============================================================================ */

// ✅ Match frontend path `/api/comments/post/:postId`
router.get("/comments/post/:postId", wrap(Comments.getCommentsByPostId));

// ✅ Create comment
router.post("/comments", wrap(Comments.createComment));

// ✅ Like/unlike comment
router.post("/comments/like", wrap(Comments.likeComment));
router.post("/comments/unlike", wrap(Comments.unlikeComment));

// ✅ Delete comment
router.delete("/comments/:commentId", wrap(Comments.deleteComment));

export default router;
