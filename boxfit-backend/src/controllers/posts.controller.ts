// controllers/posts.controller.ts
import { Request, Response } from "express";
import { ID, Query } from "node-appwrite";
import { appwriteConfig } from "../lib/appwriteConfig";
import { databases, storage } from "../lib/appwriteClient";

// =======================
// Create a new post
// =======================
export const createPost = async (req: Request, res: Response) => {
  try {
    const postData = req.body;

    const post = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      ID.unique(),
      postData
    );

    res.status(201).json(post);
  } catch (error: any) {
    console.error("Failed to create post:", error.message);
    res.status(500).json({ error: "Failed to create post" });
  }
};

// =======================
// Get a post by ID
// =======================
export const getPostById = async (req: Request, res: Response) => {
  const { postId } = req.params;

  try {
    const post = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );

    res.status(200).json(post);
  } catch (error: any) {
    console.error("Failed to fetch post:", error.message);
    res.status(500).json({ error: "Failed to fetch post" });
  }
};

// =======================
// Update post by ID
// =======================
export const updatePost = async (req: Request, res: Response) => {
  const { postId } = req.params;
  const postData = req.body;

  try {
    const updated = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId,
      postData
    );

    res.status(200).json(updated);
  } catch (error: any) {
    console.error("Failed to update post:", error.message);
    res.status(500).json({ error: "Failed to update post" });
  }
};

// =======================
// Delete post and image
// =======================
export const deletePost = async (req: Request, res: Response) => {
  const { postId, imageId } = req.params;

  try {
    if (imageId) {
      await storage.deleteFile(appwriteConfig.storageId, imageId);
    }

    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error: any) {
    console.error("Failed to delete post:", error.message);
    res.status(500).json({ error: "Failed to delete post" });
  }
};

// =======================
// Get all posts by user ID
// =======================
export const getUserPosts = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.equal("creator", userId), Query.orderDesc("$createdAt")]
    );

    res.status(200).json(posts);
  } catch (error: any) {
    console.error("Failed to get user's posts:", error.message);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
};
