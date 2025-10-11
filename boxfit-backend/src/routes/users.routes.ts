import { Router } from "express";
import * as Users from "../controllers/users.controller";
import { verifyToken } from "../middleware/verifyToken";
import { upload as uploadMiddleware } from "../middleware/upload"; // ✅ renamed to avoid conflicts

const router = Router();

// async wrapper
const wrap =
  (fn: any) =>
  (req: any, res: any, next: any) =>
    Promise.resolve(fn(req, res, next)).catch(next);

/* ================================================================
   USER ROUTES
================================================================ */
router.get("/users/current", verifyToken, wrap(Users.getCurrentUser));
router.get("/users", wrap(Users.listUsers));
router.get("/users/:id", wrap(Users.getUserById));

// ✅ Add image upload middleware (renamed to uploadMiddleware)
router.patch(
  "/users/:id",
  verifyToken,
  uploadMiddleware.single("file"),
  wrap(Users.updateUser)
);

/* ================================================================
   RELATIONSHIPS
================================================================ */
router.get("/users/:id/relationships", wrap(Users.getRelationshipsCount));
router.get("/users/:id/followers", wrap(Users.getFollowersList));
router.get("/users/:id/following", wrap(Users.getRelationshipsList));
router.post("/users/follow", verifyToken, wrap(Users.followUser));
router.delete("/users/unfollow", verifyToken, wrap(Users.unfollowByPair));
router.get("/relationships/check", wrap(Users.checkFollowStatus));

/* ================================================================
   SEARCH & ANALYTICS
================================================================ */
router.get("/users/search", wrap(Users.searchUsers));

// ✅ keep existing /likes for backward compatibility
router.get("/users/:id/likes", wrap(Users.getUserTotalLikes));

// ✅ NEW ALIAS — frontend expects `/likes/total`
router.get("/users/:id/likes/total", wrap(Users.getUserTotalLikes));

export default router;
