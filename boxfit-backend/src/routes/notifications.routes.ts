// src/routes/notifications.routes.ts
import { Router, Request, Response, NextFunction } from "express";
import * as Notifications from "../controllers/notifications.controller";

const router = Router();

// Async wrapper
const wrap =
  (fn: any) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);

/* ============================================================================
   NOTIFICATION ROUTES
============================================================================ */

// Create new notification
router.post("/notifications", wrap(Notifications.createNotification));

// Get all notifications for a user (via query param)
router.get("/notifications", wrap(Notifications.getNotifications));

// Mark single notification as read
router.patch("/notifications/:id/read", wrap(Notifications.markNotificationAsRead));

// Delete single notification
router.delete("/notifications/:id", wrap(Notifications.deleteNotification));

// Clear all notifications for a user (query version for frontend match)
router.delete("/notifications", wrap(Notifications.clearNotifications));

export default router;
