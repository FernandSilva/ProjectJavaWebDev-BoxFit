import { Router } from "express";
import * as Comments from "../controllers/comments.controller";

const router = Router();

// tiny wrapper so unhandled rejections bubble to error middleware
const wrap =
  (fn: any) =>
  (req: any, res: any, next: any) =>
    Promise.resolve(fn(req, res, next)).catch(next);

router.get("/comments/post/:postId", wrap(Comments.getCommentsByPostId));
router.post("/comments", wrap(Comments.createComment));
router.post("/comments/:id/like", wrap(Comments.likeComment));
router.post("/comments/:id/unlike", wrap(Comments.unlikeComment));
router.delete("/comments/:id", wrap(Comments.deleteComment));

export default router;
