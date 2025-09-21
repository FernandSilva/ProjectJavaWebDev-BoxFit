// src/routes/notifications.root.ts
import { Router } from "express";
import * as NotificationsController from "../controllers/notifications.controller";

const router = Router();

/** Small async wrapper to bubble errors to your error middleware */
const wrap =
  (fn: any) =>
  (req: any, res: any, next: any) =>
    Promise.resolve(fn(req, res, next)).catch(next);

/* ============================================================================
   Notifications API
   Mount at: /api/notifications

   - GET    /api/notifications?userId=&limit=&cursor=
   - GET    /api/notifications/:userId           (back-compat -> delegates to query form)
   - POST   /api/notifications
   - PATCH  /api/notifications/:id/read
   - PATCH  /api/notifications/read-all?userId=
   - DELETE /api/notifications/:id
   - DELETE /api/notifications?userId=           (clear all for a user)
============================================================================ */

/** List notifications (newest first) by userId (query param) */
router.get("/", wrap(NotificationsController.listNotifications));

/** Back-compat: list by path param, delegates to listNotifications */
router.get(
  "/:userId",
  wrap((req, res) => {
    req.query.userId = req.params.userId;
    return NotificationsController.listNotifications(req, res);
  })
);

/** Create a notification */
router.post("/", wrap(NotificationsController.createNotification));

/** Mark a single notification as read */
router.patch("/:id/read", wrap(NotificationsController.markRead));

/** Mark all notifications as read for a user (userId query param) */
router.patch("/read-all", wrap(NotificationsController.markAllRead));

/** Delete a single notification by id */
router.delete("/:id", wrap(NotificationsController.deleteNotification));

/** Clear all notifications for a user (userId query param) */
router.delete("/", wrap(NotificationsController.clearNotifications));

export default router;
