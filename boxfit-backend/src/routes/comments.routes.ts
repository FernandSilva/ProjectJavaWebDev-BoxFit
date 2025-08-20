import express from "express";
import { ID, Query } from "node-appwrite";
import { databases } from "../lib/appwriteClient";
import { appwriteConfig } from "../lib/appwriteConfig";

const router = express.Router();

// ============================
// CREATE COMMENT
// ============================
router.post("/", async (req, res) => {
  try {
    const commentData = req.body;

    const newComment = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.commentsCollectionId,
      ID.unique(),
      commentData
    );

    res.status(201).json(newComment);
  } catch (error) {
    console.error("❌ Error creating comment:", error.message);
    res.status(500).json({ error: "Failed to create comment" });
  }
});

// ============================
// DELETE COMMENT
// ============================
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.commentsCollectionId,
      id
    );

    res.status(200).json({ message: "Comment deleted" });
  } catch (error) {
    console.error("❌ Error deleting comment:", error.message);
    res.status(500).json({ error: "Failed to delete comment" });
  }
});

// ============================
// GET COMMENTS BY POST ID
// ============================
router.get("/post/:postId", async (req, res) => {
  const { postId } = req.params;

  if (!postId) {
    return res.status(400).json({ error: "Post ID is required" });
  }

  try {
    const comments = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.commentsCollectionId,
      [Query.equal("postId", postId), Query.orderDesc("$createdAt")]
    );

    res.status(200).json(comments.documents);
  } catch (err) {
    console.error("❌ Error fetching comments:", err.message);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

export default router;
