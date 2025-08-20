// controllers/saves.controller.ts

import { Request, Response } from "express";
import { ID, Query } from "node-appwrite";
import { databases } from "../lib/appwriteClient";
import { appwriteConfig } from "../lib/appwriteConfig";

// ============================
// Save a post
// ============================
export const savePost = async (req: Request, res: Response) => {
  const { userId, postId } = req.body;

  if (!userId || !postId) {
    return res.status(400).json({ error: "userId and postId are required" });
  }

  try {
    const result = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      ID.unique(),
      { userId, postId }
    );

    return res.status(201).json(result);
  } catch (error: any) {
    console.error("Error saving post:", error.message);
    return res.status(500).json({ error: "Failed to save post" });
  }
};

// ============================
// Get saved posts by user
// ============================
export const getSavedPostsByUser = async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  try {
    const saved = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      [Query.equal("userId", userId)]
    );

    return res.status(200).json(saved);
  } catch (error: any) {
    console.error("Error fetching saved posts:", error.message);
    return res.status(500).json({ error: "Failed to get saved posts" });
  }
};

// ============================
// Delete a saved post
// ============================
export const deleteSavedPost = async (req: Request, res: Response) => {
  const { saveId } = req.params;

  if (!saveId) {
    return res.status(400).json({ error: "saveId is required" });
  }

  try {
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      saveId
    );

    return res.status(200).json({ message: "Saved post deleted" });
  } catch (error: any) {
    console.error("Error deleting saved post:", error.message);
    return res.status(500).json({ error: "Failed to delete saved post" });
  }
};
