// controllers/likes.controller.ts
import { Request, Response } from "express";
import { ID, Query } from "node-appwrite";
import { databases } from "../lib/appwriteClient";
import { appwriteConfig } from "../lib/appwriteConfig";

// Like a post
export const likePost = async (req: Request, res: Response) => {
  try {
    const newLike = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.likesCollectionId,
      ID.unique(),
      req.body
    );

    res.status(201).json(newLike);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error liking post:", error.message);
    } else {
      console.error("Unknown error liking post:", error);
    }
    res.status(500).json({ error: "Failed to like post" });
  }
};

// Unlike a post
export const unlikePost = async (req: Request, res: Response) => {
  const { likeId } = req.body;

  try {
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.likesCollectionId,
      likeId
    );

    res.status(200).json({ message: "Post unliked" });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error unliking post:", error.message);
    } else {
      console.error("Unknown error unliking post:", error);
    }
    res.status(500).json({ error: "Failed to unlike post" });
  }
};

// ✅ Get all likes for a specific post
export const getPostLikes = async (req: Request, res: Response) => {
  const { postId } = req.params;

  try {
    const result = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.likesCollectionId,
      [Query.equal("postId", postId)]
    );

    res.status(200).json(result.documents);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching post likes:", error.message);
    } else {
      console.error("Unknown error fetching post likes:", error);
    }
    res.status(500).json({ error: "Failed to fetch post likes" });
  }
};

// ✅ Get total likes received by a specific user
export const getUserTotalLikes = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const result = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.likesCollectionId,
      [Query.equal("postCreator", userId)]
    );

    res.status(200).json({ totalLikes: result.documents.length });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching user total likes:", error.message);
    } else {
      console.error("Unknown error fetching user total likes:", error);
    }
    res.status(500).json({ error: "Failed to fetch user total likes" });
  }
};
