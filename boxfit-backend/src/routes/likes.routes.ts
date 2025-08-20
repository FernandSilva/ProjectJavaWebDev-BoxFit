import express from "express";
import {
  likePost,
  unlikePost,
  getPostLikes,
  getUserTotalLikes,
} from "../controllers/likes.controller";

const router = express.Router();

// Like a post
router.post("/", likePost);

// Unlike a post
router.delete("/", unlikePost);

// Get likes for a specific post
router.get("/post/:postId", getPostLikes);

// Get total likes for a specific user
router.get("/user/:userId/total", getUserTotalLikes);

export default router;
