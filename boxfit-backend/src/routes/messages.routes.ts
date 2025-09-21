// src/routes/messages.routes.ts
import { Router, Request, Response, NextFunction } from "express";
import * as MessagesController from "../controllers/messages.controller";

const router = Router();

const wrap =
  (fn: any) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);

/* ============================================================================
   Messages API  (mount at /api/messages)

   - GET    /api/messages/thread?userId=&peerId=&limit=
   - GET    /api/messages/contacts?userId=&q=
   - POST   /api/messages
   - DELETE /api/messages/:id
   - PATCH  /api/messages/read        (body: { senderId, recipientId })
============================================================================ */

/**
 * If userId or peerId is missing/blank, return an empty thread instead of 400.
 * This keeps the UI quiet while no conversation is selected.
 */
function guardEmptyThreadParams(req: Request, res: Response, next: NextFunction) {
  const userId = String(req.query.userId ?? "").trim();
  const peerId = String(req.query.peerId ?? "").trim();

  if (!userId || !peerId) {
    return res.status(200).json({ total: 0, documents: [] });
  }
  return next();
}

/**
 * Ensure the body contains both senderId and recipientId for read marking.
 */
function guardMarkReadBody(req: Request, res: Response, next: NextFunction) {
  const { senderId, recipientId } = req.body || {};
  if (!senderId || !recipientId) {
    return res.status(400).json({ error: "senderId and recipientId are required" });
  }
  return next();
}

router.get("/thread", guardEmptyThreadParams, wrap(MessagesController.getThread));
router.get("/contacts", wrap(MessagesController.listContacts));
router.post("/", wrap(MessagesController.createMessage));
router.delete("/:id", wrap(MessagesController.deleteMessage));
router.patch("/read", guardMarkReadBody, wrap(MessagesController.markThreadRead));

export default router;
