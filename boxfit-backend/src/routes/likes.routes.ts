import { Router } from "express";
import {
  likePost,
  unlikePost,
  getLikedPostsByUser,
  likeComment,
  unlikeComment,
  getUserTotalLikes,
} from "../controllers/likes.controller";

const router = Router();

// Post likes
router.post("/posts/:postId/like", likePost);      // toggle like
router.post("/posts/:postId/unlike", unlikePost);  // optional explicit unlike

// Liked posts list for Profile → /api/likes/user/:userId
router.get("/user/:userId", getLikedPostsByUser);

// Comment likes
router.post("/comments/like", likeComment);
router.post("/comments/unlike", unlikeComment);

// Total likes for a user (you already use this)
router.get("/users/:userId/total", getUserTotalLikes);

export default router;
