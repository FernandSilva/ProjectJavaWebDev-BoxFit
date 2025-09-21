// src/routes/users.routes.ts
import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import * as UsersController from "../controllers/users.controller";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Small async wrapper
const wrap =
  (fn: any) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);

/* =============================================================================
   Users + Relationships
   (Order matters: fixed /users/* routes before /users/:id)
============================================================================= */

// Search & leaderboard
router.get("/users/search", wrap(UsersController.searchUsers));
router.get("/users/top", wrap(UsersController.getTopMembers));

// Listing, relationship counts & lists, likes total
router.get("/users", wrap(UsersController.listUsers));
router.get("/users/:id/relationships", wrap(UsersController.getRelationshipsCount));
router.get("/users/:id/relationships/list", wrap(UsersController.getRelationshipsList));
router.get("/users/:id/followers", wrap(UsersController.getFollowersList));
router.get("/users/:id/likes/total", wrap(UsersController.getUserTotalLikes));

// ✅ NEW: Fetch user by Appwrite accountId (used by frontend `account.get()`)
router.get("/users/by-account/:accountId", wrap(UsersController.getUserByAccountId));

// Single user by docId must come last to avoid route collision
router.get("/users/:id", wrap(UsersController.getUserById));

// Profile update (supports avatar upload via field name "file")
router.patch("/users/:id", upload.single("file"), wrap(UsersController.updateUser));

// Follow / Unfollow / Check
router.post("/relationships", wrap(UsersController.followUser));
router.delete("/relationships/:docId", wrap(UsersController.unfollowByDocId));
router.delete("/relationships", wrap(UsersController.unfollowByPair));
router.get("/relationships/check", wrap(UsersController.checkFollowStatus));

export default router;
