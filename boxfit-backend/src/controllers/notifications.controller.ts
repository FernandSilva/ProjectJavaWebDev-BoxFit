// src/controllers/notifications.controller.ts
import { Request, Response } from "express";
import { ID, Query } from "node-appwrite";
import { databases, ids } from "../lib/appwriteClient";

const DB = ids.databaseId;
const NOTIFS = ids.notificationsCollectionId;

const toInt = (v: unknown, d = 20, max = 100) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : d;
};

/**
 * GET /api/notifications?userId=...&limit=20&cursor=<docId>
 * Returns paginated notifications for a user (newest first).
 */
export async function listNotifications(req: Request, res: Response) {
  try {
    const userId = String(req.query.userId || "");
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const limit = toInt(req.query.limit, 20);
    const cursor = req.query.cursor ? String(req.query.cursor) : undefined;

    const queries = [
      Query.equal("userId", userId),
      Query.orderDesc("$createdAt"),
      Query.limit(limit),
    ];
    if (cursor) queries.push(Query.cursorAfter(cursor));

    const docs = await databases.listDocuments(DB, NOTIFS, queries);
    res.json(docs);
  } catch (err: any) {
    (req as any).log?.error?.({ msg: "notifications.list.error", err: err?.message });
    res.status(500).json({ error: "Failed to list notifications" });
  }
}

/**
 * POST /api/notifications
 * Body: { userId, senderId, type, content, relatedId?, referenceId?, isRead?, createdAt?, senderName?, senderImageUrl? }
 */
export async function createNotification(req: Request, res: Response) {
  try {
    const payload = { ...(req.body || {}) };

    // minimal validation
    const required = ["userId", "senderId", "type", "content"];
    for (const k of required) {
      if (!payload[k]) {
        return res.status(400).json({ error: `${k} is required` });
      }
    }

    if (payload.isRead == null) payload.isRead = false;
    if (!payload.createdAt) payload.createdAt = new Date().toISOString();

    const doc = await databases.createDocument(DB, NOTIFS, ID.unique(), payload);
    res.status(201).json(doc);
  } catch (err: any) {
    (req as any).log?.error?.({ msg: "notifications.create.error", err: err?.message });
    res.status(500).json({ error: "Failed to create notification" });
  }
}

/**
 * PATCH /api/notifications/:id/read
 * Marks a single notification as read.
 */
export async function markRead(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const doc = await databases.updateDocument(DB, NOTIFS, id, {
      isRead: true,
      readAt: new Date().toISOString(),
    });
    res.json(doc);
  } catch (err: any) {
    (req as any).log?.error?.({ msg: "notifications.markRead.error", err: err?.message });
    res.status(500).json({ error: "Failed to update notification" });
  }
}

/**
 * DELETE /api/notifications/:id
 * Deletes a single notification.
 */
export async function deleteNotification(req: Request, res: Response) {
  try {
    await databases.deleteDocument(DB, NOTIFS, req.params.id);
    res.status(204).end();
  } catch (err: any) {
    (req as any).log?.warn?.({ msg: "notifications.delete.error", err: err?.message });
    res.status(404).json({ error: "Notification not found" });
  }
}

/**
 * DELETE /api/notifications?userId=...
 * Clears all notifications for a user (best-effort, up to 200 at a time).
 */
export async function clearNotifications(req: Request, res: Response) {
  try {
    const userId = String(req.query.userId || "");
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const list = await databases.listDocuments(DB, NOTIFS, [
      Query.equal("userId", userId),
      Query.limit(200),
    ]);

    await Promise.all(
      list.documents.map((d: any) => databases.deleteDocument(DB, NOTIFS, d.$id))
    );

    res.status(204).end();
  } catch (err: any) {
    (req as any).log?.error?.({ msg: "notifications.clear.error", err: err?.message });
    res.status(500).json({ error: "Failed to clear notifications" });
  }
}

/**
 * PATCH /api/notifications/read-all?userId=...
 * Marks all unread notifications for a user as read (best-effort, up to 200).
 */
export async function markAllRead(req: Request, res: Response) {
  try {
    const userId = String(req.query.userId || "");
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const list = await databases.listDocuments(DB, NOTIFS, [
      Query.equal("userId", userId),
      Query.equal("isRead", false),
      Query.limit(200),
    ]);

    const now = new Date().toISOString();
    await Promise.all(
      list.documents.map((d: any) =>
        databases.updateDocument(DB, NOTIFS, d.$id, { isRead: true, readAt: now })
      )
    );

    res.status(204).end();
  } catch (err: any) {
    (req as any).log?.error?.({ msg: "notifications.markAllRead.error", err: err?.message });
    res.status(500).json({ error: "Failed to mark all read" });
  }
}
