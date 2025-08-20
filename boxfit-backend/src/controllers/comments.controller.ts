// controllers/comments.controller.ts
import { Request, Response } from "express";
import { ID, Query } from "node-appwrite";
import { appwriteConfig } from "../lib/appwriteConfig";
import { databases } from "../lib/appwriteClient";

// =======================
// Create Comment
// =======================
export const createComment = async (req: Request, res: Response) => {
  try {
    const newComment = req.body;

    const comment = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.commentsCollectionId,
      ID.unique(),
      newComment
    );

    res.status(201).json(comment);
  } catch (error: any) {
    console.error("Failed to create comment:", error.message);
    res.status(500).json({ error: "Failed to create comment" });
  }
};

// =======================
// Delete Comment
// =======================
export const deleteComment = async (req: Request, res: Response) => {
  const { commentId } = req.params;

  try {
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.commentsCollectionId,
      commentId
    );

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error: any) {
    console.error("Failed to delete comment:", error.message);
    res.status(500).json({ error: "Failed to delete comment" });
  }
};

// =======================
// Get Comments By Post ID
// =======================
export const getCommentsByPost = async (req: Request, res: Response) => {
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

    res.status(200).json(comments);
  } catch (err: any) {
    console.error("Error fetching comments:", err.message);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
};

// =======================
// Like a Comment
// =======================
export const likeComment = async (req: Request, res: Response) => {
  const { commentId } = req.params;
  const { userId } = req.body;

  try {
    const comment = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.commentsCollectionId,
      commentId
    );

    const updatedLikes = [...(comment.liked || []), userId];

    const updatedComment = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.commentsCollectionId,
      commentId,
      { liked: updatedLikes }
    );

    res.status(200).json(updatedComment);
  } catch (error: any) {
    console.error("Failed to like comment:", error.message);
    res.status(500).json({ error: "Failed to like comment" });
  }
};

// =======================
// Unlike a Comment
// =======================
export const unlikeComment = async (req: Request, res: Response) => {
  const { commentId } = req.params;
  const { userId } = req.body;

  try {
    const comment = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.commentsCollectionId,
      commentId
    );

    const updatedLikes = (comment.liked || []).filter((id: string) => id !== userId);

    const updatedComment = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.commentsCollectionId,
      commentId,
      { liked: updatedLikes }
    );

    res.status(200).json(updatedComment);
  } catch (error: any) {
    console.error("Failed to unlike comment:", error.message);
    res.status(500).json({ error: "Failed to unlike comment" });
  }
};
