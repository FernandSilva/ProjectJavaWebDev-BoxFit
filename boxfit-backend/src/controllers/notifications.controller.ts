// src/controllers/notifications.controller.ts
import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import Notification from "../models/Notification";

const log = (...args: any[]) =>
  console.log("[NOTIFS]", new Date().toISOString(), "-", ...args);

/**
 * Shape helper for consistent logging of documents
 */
const brief = (n: any) => {
  if (!n) return n;
  return {
    _id: n._id,
    userId: n.userId,
    senderId: n.senderId,
    type: n.type,
    isRead: n.isRead,
    createdAt: n.createdAt,
  };
};

// ============================================================================
// CREATE
// ============================================================================
export const createNotification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    log("CREATE → body:", req.body);

    const {
      userId,          // recipient
      senderId,
      type,
      content = "",
      relatedId = "",
      referenceId = "",
      senderName = "",
      senderImageUrl = "",
    } = req.body || {};

    // Validate minimal fields
    if (!userId || !senderId || !type) {
      log("CREATE ❌ missing fields", { userId, senderId, type });
      return res.status(400).json({ error: "userId, senderId and type are required" });
    }

    // Avoid self-notifications for certain types if desired (comment this out if not needed)
    // if (userId === senderId && type !== "system") {
    //   log("CREATE ⚠️ skipping self-notification");
    //   return res.status(200).json({ skipped: true });
    // }

    const notification = await Notification.create({
      userId,
      senderId,
      type,
      content,
      relatedId,
      referenceId,
      senderName,
      senderImageUrl,
      isRead: false,
      createdAt: new Date(),
    });

    log("CREATE ✅ created:", brief(notification));
    return res.status(201).json(notification);
  } catch (err) {
    log("CREATE ❌ error:", err);
    next(err);
  }
};

// ============================================================================
// LIST (by userId)
// ============================================================================
export const getNotifications = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    const notifs = await Notification.find({ userId }).sort({ createdAt: -1 });
    console.log(`[NOTIFS] ${new Date().toISOString()} - LIST ✅ count: ${notifs.length}`);
    res.status(200).json(notifs); // ✅ returns array
  } catch (err) {
    console.error("[NOTIFS] LIST ❌", err);
    res.status(500).json({ error: "Failed to list notifications" });
  }
};


// ============================================================================
// MARK READ
// ============================================================================
export const markNotificationAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    log("READ → id:", id);

    if (!id || id === "undefined" || !mongoose.Types.ObjectId.isValid(id)) {
      log("READ ❌ invalid id:", id);
      return res.status(400).json({ error: "Invalid notification ID" });
    }

    const updated = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );

    if (!updated) {
      log("READ ❌ not found:", id);
      return res.status(404).json({ error: "Notification not found" });
    }

    log("READ ✅ updated:", brief(updated));
    return res.status(200).json(updated);
  } catch (err) {
    log("READ ❌ error:", err);
    next(err);
  }
};

// ============================================================================
// DELETE ONE
// ============================================================================
export const deleteNotification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    log("DELETE → id:", id);

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      log("DELETE ❌ invalid id:", id);
      return res.status(400).json({ error: "Invalid notification ID" });
    }

    const deleted = await Notification.findByIdAndDelete(id);
    if (!deleted) {
      log("DELETE ❌ not found:", id);
      return res.status(404).json({ error: "Notification not found" });
    }

    log("DELETE ✅ removed:", brief(deleted));
    return res.status(200).json({ message: "Notification deleted successfully" });
  } catch (err) {
    log("DELETE ❌ error:", err);
    next(err);
  }
};

// ============================================================================
// CLEAR ALL FOR USER
// ============================================================================
export const clearNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    log("CLEAR → userId:", userId);

    if (!userId) {
      log("CLEAR ❌ missing userId");
      return res.status(400).json({ error: "userId is required" });
    }

    const result = await Notification.deleteMany({ userId });
    log("CLEAR ✅ deletedCount:", result?.deletedCount ?? 0);
    return res.status(200).json({ message: "All notifications cleared", deleted: result?.deletedCount ?? 0 });
  } catch (err) {
    log("CLEAR ❌ error:", err);
    next(err);
  }
};
