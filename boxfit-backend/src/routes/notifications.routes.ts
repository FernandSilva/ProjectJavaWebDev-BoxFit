import express from "express";
import { ID, Query } from "node-appwrite";
import { databases } from "../lib/appwriteClient";
import { appwriteConfig } from "../lib/appwriteConfig";

const router = express.Router();

// Create a new notification
router.post("/", async (req, res) => {
  try {
    const notification = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.notificationsCollectionId,
      ID.unique(),
      req.body
    );
    res.status(201).json(notification);
  } catch (error) {
    console.error("Error creating notification:", error.message);
    res.status(500).json({ error: "Failed to create notification" });
  }
});

// Get all notifications for a user
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.notificationsCollectionId,
      [Query.equal("userId", userId), Query.orderDesc("$createdAt")]
    );

    res.status(200).json(response.documents);
  } catch (error) {
    console.error("Error fetching notifications:", error.message);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// Mark a notification as read
router.patch("/:id/read", async (req, res) => {
  const { id } = req.params;

  try {
    const updated = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.notificationsCollectionId,
      id,
      { isRead: true }
    );

    res.status(200).json(updated);
  } catch (error) {
    console.error("Error marking notification as read:", error.message);
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
});

// Delete a notification
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.notificationsCollectionId,
      id
    );
    res.status(200).json({ message: "Notification deleted" });
  } catch (error) {
    console.error("Error deleting notification:", error.message);
    res.status(500).json({ error: "Failed to delete notification" });
  }
});

export default router;
