// routes/follows.routes.ts
import express from "express";
import {
  followUser,
  unfollowUser,
  checkFollowStatus,
  getUserRelationships,
} from "../controllers/follows.controller";

const router = express.Router();

// Follow a user
router.post("/", followUser);

// Unfollow a user
router.delete("/:documentId", unfollowUser);

// Check follow status between two users
router.get("/status", checkFollowStatus);

// Get follow/follower counts for a user
router.get("/relationships/:userId", getUserRelationships);

export default router;
