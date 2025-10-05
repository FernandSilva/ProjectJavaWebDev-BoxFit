import { Router, Request, Response, NextFunction } from "express";
import * as Follows from "../controllers/follows.controller";

const router = Router();

// Async wrapper
const wrap =
  (fn: any) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);

/* ============================================================================
   FOLLOW ROUTES
============================================================================ */

// Follow / Unfollow
router.post("/follows", wrap(Follows.followUser));
router.delete("/follows/:id", wrap(Follows.unfollowById));
router.delete("/follows", wrap(Follows.unfollowByPair));

// Followers / Following
router.get("/follows/:userId/followers", wrap(Follows.getFollowers));
router.get("/follows/:userId/following", wrap(Follows.getFollowing));

// Status check
router.get("/follows/check", wrap(Follows.checkFollowStatus));

export default router;
