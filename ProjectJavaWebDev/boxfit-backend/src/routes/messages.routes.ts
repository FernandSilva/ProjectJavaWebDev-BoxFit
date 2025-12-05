import { Router, Request, Response, NextFunction } from "express";
import * as Messages from "../controllers/messages.controller";

const router = Router();

// Async wrapper for safe error handling
const wrap =
  (fn: any) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);

/* ============================================================================
   ✅ MESSAGE ROUTES (Aligned with frontend)
============================================================================ */

// 📨 Send a new message
router.post("/", wrap(Messages.sendMessage));

// 💬 Get conversation thread between two users (by query)
router.get("/thread", wrap(Messages.getMessagesBetweenUsers));

// 👥 Get all contacts for a user (frontend calls /api/messages/contacts)
router.get("/contacts", wrap(Messages.getContacts));

// ❌ Delete a specific message
router.delete("/:messageId", wrap(Messages.deleteMessage));

export default router;
