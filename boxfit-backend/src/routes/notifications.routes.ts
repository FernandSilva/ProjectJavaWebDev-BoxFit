// src/routes/notifications.routes.ts
import { Router } from "express";
import {
  getNotifications,
  createNotification,
  markNotificationAsRead,
  deleteNotification,
  clearNotifications,
} from "../controllers/notifications.controller";
import { verifyToken } from "../middleware/verifyToken";

const router = Router();

/**
 * --------------------------------------------------------------------
 *  Notifications Routes
 *  Mounted in server.ts as: app.use("/api/notifications", notificationsRouter)
 *  So these routes map to:
 *    GET    /api/notifications?userId=xxx
 *    POST   /api/notifications
 *    PATCH  /api/notifications/:id/read
 *    DELETE /api/notifications/:id
 *    DELETE /api/notifications/user/:userId/clear
 * --------------------------------------------------------------------
 */

// ✅ Quick health check (optional)
router.get("/health", (_req, res) => {
  console.log("[NOTIFS]", new Date().toISOString(), "- HEALTH OK");
  res.status(200).json({ ok: true });
});

// ✅ Get all notifications for a user
router.get("/", verifyToken, getNotifications);

// ✅ Create a new notification
router.post("/", verifyToken, createNotification);

// ✅ Mark a notification as read
router.patch("/:id/read", verifyToken, markNotificationAsRead);

// ✅ Delete a specific notification
router.delete("/:id", verifyToken, deleteNotification);

// ✅ Clear all notifications for a user
router.delete("/user/:userId/clear", verifyToken, clearNotifications);

export default router;
