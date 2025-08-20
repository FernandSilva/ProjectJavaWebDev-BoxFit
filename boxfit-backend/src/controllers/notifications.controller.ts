// controllers/notifications.controller.ts
import { Request, Response } from "express";
import { ID, Query } from "node-appwrite";
import { databases } from "../lib/appwriteClient";
import { appwriteConfig } from "../lib/appwriteConfig";

// ============================
// Create Notification
// ============================
export const createNotification = async (req: Request, res: Response) => {
  try {
    const notification = req.body;

    const created = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.notificationsCollectionId,
      ID.unique(),
      notification
    );

    res.status(201).json(created);
  } catch (error: any) {
    console.error("Failed to create notification:", error.message);
    res.status(500).json({ error: "Failed to create notification" });
  }
};

// ============================
// Get Notifications by User ID
// ============================
export const getNotifications = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const notifications = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.notificationsCollectionId,
      [Query.equal("userId", userId), Query.orderDesc("$createdAt")]
    );

    res.status(200).json(notifications);
  } catch (error: any) {
    console.error("Failed to fetch notifications:", error.message);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

// ============================
// Mark Notification as Read
// ============================
export const markNotificationAsRead = async (req: Request, res: Response) => {
  const { notificationId } = req.params;

  try {
    const updated = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.notificationsCollectionId,
      notificationId,
      { isRead: true }
    );

    res.status(200).json(updated);
  } catch (error: any) {
    console.error("Failed to mark notification as read:", error.message);
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
};

// ============================
// Delete Notification
// ============================
export const deleteNotification = async (req: Request, res: Response) => {
  const { notificationId } = req.params;

  try {
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.notificationsCollectionId,
      notificationId
    );

    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error: any) {
    console.error("Failed to delete notification:", error.message);
    res.status(500).json({ error: "Failed to delete notification" });
  }
};
