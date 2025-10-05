import { Router, Request, Response, NextFunction } from "express";
import * as Messages from "../controllers/messages.controller";

const router = Router();

// Async wrapper
const wrap =
  (fn: any) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);

/* ============================================================================
   MESSAGE ROUTES
============================================================================ */

// Send a new message
router.post("/", wrap(Messages.sendMessage));

// Get messages between two users
router.get("/:userId1/:userId2", wrap(Messages.getMessagesBetweenUsers));

// Get all conversation partners for a user
router.get("/conversations/:userId", wrap(Messages.getUserConversations));

// Delete a message
router.delete("/:messageId", wrap(Messages.deleteMessage));

export default router;
