import express from "express";
import { ID, Query } from "node-appwrite";
import { databases, storage } from "../lib/appwriteClient";
import { appwriteConfig } from "../lib/appwriteConfig";

const router = express.Router();

// Create a post
router.post("/", async (req, res) => {
  try {
    const newPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      ID.unique(),
      req.body
    );
    res.status(201).json(newPost);
  } catch (err) {
    console.error("Error creating post:", err.message);
    res.status(500).json({ error: "Failed to create post" });
  }
});

// Get post by ID
router.get("/:postId", async (req, res) => {
  try {
    const post = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      req.params.postId
    );
    res.status(200).json(post);
  } catch (err) {
    console.error("Error getting post:", err.message);
    res.status(500).json({ error: "Failed to get post" });
  }
});

// Update post by ID
router.put("/:postId", async (req, res) => {
  try {
    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      req.params.postId,
      req.body
    );
    res.status(200).json(updatedPost);
  } catch (err) {
    console.error("Error updating post:", err.message);
    res.status(500).json({ error: "Failed to update post" });
  }
});

// Delete post by ID and image from storage (if imageId is provided)
router.delete("/:postId", async (req, res) => {
  const { imageId } = req.body;
  try {
    if (imageId) {
      await storage.deleteFile(appwriteConfig.storageId, imageId);
    }

    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      req.params.postId
    );

    res.status(200).json({ message: "Post deleted" });
  } catch (err) {
    console.error("Error deleting post:", err.message);
    res.status(500).json({ error: "Failed to delete post" });
  }
});

// Get all posts by a user
router.get("/user/:userId", async (req, res) => {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.equal("creator", req.params.userId), Query.orderDesc("$createdAt")]
    );

    res.status(200).json(posts);
  } catch (err) {
    console.error("Error getting user posts:", err.message);
    res.status(500).json({ error: "Failed to get user posts" });
  }
});

export default router;
