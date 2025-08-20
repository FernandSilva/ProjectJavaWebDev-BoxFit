// controllers/likes.controller.ts
import { Request, Response } from "express";
import { databases } from "../lib/appwriteClient";
import { appwriteConfig } from "../lib/appwriteConfig";

// ============================
// Like a Post
// ============================
export const likePost = async (req: Request, res: Response) => {
  const { postId } = req.params;
  const { userId } = req.body;

  if (!postId || !userId) {
    return res.status(400).json({ error: "Post ID and User ID are required." });
  }

  try {
    const post = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );

    const updatedLikes = [...(post.liked || []), userId];

    const updated = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId,
      { liked: updatedLikes }
    );

    res.status(200).json(updated);
  } catch (error: any) {
    console.error("Error liking post:", error.message);
    res.status(500).json({ error: "Failed to like post." });
  }
};

// ============================
// Unlike a Post
// ============================
export const unlikePost = async (req: Request, res: Response) => {
  const { postId } = req.params;
  const { userId } = req.body;

  if (!postId || !userId) {
    return res.status(400).json({ error: "Post ID and User ID are required." });
  }

  try {
    const post = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );

    const updatedLikes = (post.liked || []).filter((id: string) => id !== userId);

    const updated = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId,
      { liked: updatedLikes }
    );

    res.status(200).json(updated);
  } catch (error: any) {
    console.error("Error unliking post:", error.message);
    res.status(500).json({ error: "Failed to unlike post." });
  }
};
