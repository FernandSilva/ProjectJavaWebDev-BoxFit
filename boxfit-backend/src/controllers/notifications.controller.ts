// src/controllers/notifications.controller.ts
import { Request, Response, NextFunction } from "express";
import Notification from "../models/Notification";
import User from "../models/User";

/* ============================================================================
   CREATE NEW NOTIFICATION
============================================================================ */
export async function createNotification(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId, senderId, type, relatedId, referenceId, content } = req.body;

    if (!userId || !senderId || !type) {
      return res.status(400).json({ error: "userId, senderId, and type are required" });
    }

    const sender = await User.findById(senderId).lean();

    const notification = new Notification({
      userId,
      senderId,
      type,
      relatedId,
      referenceId,
      content: content || `${sender?.name || "Someone"} sent you a ${type}`,
      isRead: false,
      createdAt: new Date(),
      senderName: sender?.name || "",
      senderImageUrl: sender?.imageUrl || "",
    });

    await notification.save();
    return res.status(201).json(notification);
  } catch (err) {
    console.error("❌ createNotification error:", err);
    return next(err);
  }
}

/* ============================================================================
   GET NOTIFICATIONS FOR USER  → matches `/api/notifications?userId=...`
============================================================================ */
export async function getNotifications(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const limit = Number(req.query.limit) || 50;
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // ✅ Always respond 200 with a consistent structure
    return res.status(200).json({
      documents: notifications || [],
      total: notifications?.length || 0,
    });
  } catch (err) {
    console.error("❌ getNotifications error:", err);
    return next(err);
  }
}

/* ============================================================================
   MARK NOTIFICATION AS READ
============================================================================ */
export async function markNotificationAsRead(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Notification ID required" });

    const updated = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    ).lean();

    if (!updated) return res.status(404).json({ error: "Notification not found" });
    return res.status(200).json(updated);
  } catch (err) {
    console.error("❌ markNotificationAsRead error:", err);
    return next(err);
  }
}

/* ============================================================================
   DELETE SINGLE NOTIFICATION
============================================================================ */
export async function deleteNotification(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Notification ID required" });

    const deleted = await Notification.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Notification not found" });

    return res.status(200).json({ message: "Notification deleted" });
  } catch (err) {
    console.error("❌ deleteNotification error:", err);
    return next(err);
  }
}

/* ============================================================================
   CLEAR ALL NOTIFICATIONS FOR USER  → matches DELETE `/api/notifications?userId=...`
============================================================================ */
export async function clearNotifications(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "userId query parameter required" });

    const result = await Notification.deleteMany({ userId });
    return res.status(200).json({
      message: "All notifications cleared",
      deletedCount: result.deletedCount || 0,
    });
  } catch (err) {
    console.error("❌ clearNotifications error:", err);
    return next(err);
  }
}
