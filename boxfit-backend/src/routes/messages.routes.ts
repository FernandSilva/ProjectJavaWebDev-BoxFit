import express from "express";
import { ID, Query } from "node-appwrite";
import { databases } from "../lib/appwriteClient";
import { appwriteConfig } from "../lib/appwriteConfig";

const router = express.Router();

// Create a new message
router.post("/", async (req, res) => {
  try {
    const message = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.messageCollectionId,
      ID.unique(),
      req.body
    );
    res.status(201).json(message);
  } catch (error) {
    console.error("Error creating message:", error.message);
    res.status(500).json({ error: "Failed to create message" });
  }
});

// Get all messages between two users (senderId and recipientId)
router.get("/", async (req, res) => {
  const { senderId, recipientId } = req.query;

  if (!senderId || !recipientId) {
    return res.status(400).json({ error: "senderId and recipientId are required" });
  }

  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.messageCollectionId,
      [
        Query.or([
          Query.and([Query.equal("senderId", senderId), Query.equal("recipientId", recipientId)]),
          Query.and([Query.equal("senderId", recipientId), Query.equal("recipientId", senderId)]),
        ]),
        Query.orderAsc("$createdAt"),
      ]
    );

    res.status(200).json(response.documents);
  } catch (error) {
    console.error("Error fetching messages:", error.message);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Delete a message
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.messageCollectionId,
      id
    );
    res.status(200).json({ message: "Message deleted" });
  } catch (error) {
    console.error("Error deleting message:", error.message);
    res.status(500).json({ error: "Failed to delete message" });
  }
});

// Mark all messages from sender as read
router.patch("/mark-as-read", async (req, res) => {
  const { senderId, recipientId } = req.body;

  if (!senderId || !recipientId) {
    return res.status(400).json({ error: "senderId and recipientId are required" });
  }

  try {
    const result = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.messageCollectionId,
      [
        Query.equal("senderId", senderId),
        Query.equal("recipientId", recipientId),
        Query.equal("isRead", false),
      ]
    );

    for (const msg of result.documents) {
      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.messageCollectionId,
        msg.$id,
        { isRead: true }
      );
    }

    res.status(200).json({ message: "Messages marked as read" });
  } catch (error) {
    console.error("Error marking messages as read:", error.message);
    res.status(500).json({ error: "Failed to mark messages as read" });
  }
});

export default router;
