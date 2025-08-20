// controllers/follows.controller.ts
import { Request, Response } from "express";
import { ID, Query } from "node-appwrite";
import { appwriteConfig } from "../lib/appwriteConfig";
import { databases } from "../lib/appwriteClient";

// ============================
// Follow a User
// ============================
export const followUser = async (req: Request, res: Response) => {
  const { userId, followsUserId } = req.body;

  if (!userId || !followsUserId) {
    return res.status(400).json({ error: "Both userId and followsUserId are required." });
  }

  try {
    const doc = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.followsCollectionId,
      ID.unique(),
      { userId, followsUserId }
    );

    res.status(201).json(doc);
  } catch (err: any) {
    console.error("Error following user:", err.message);
    res.status(500).json({ error: "Failed to follow user" });
  }
};

// ============================
// Unfollow a User
// ============================
export const unfollowUser = async (req: Request, res: Response) => {
  const { documentId } = req.params;

  if (!documentId) {
    return res.status(400).json({ error: "documentId is required." });
  }

  try {
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.followsCollectionId,
      documentId
    );

    res.status(200).json({ message: "Unfollowed successfully." });
  } catch (err: any) {
    console.error("Error unfollowing user:", err.message);
    res.status(500).json({ error: "Failed to unfollow user" });
  }
};

// ============================
// Check Follow Status
// ============================
export const checkFollowStatus = async (req: Request, res: Response) => {
  const { userId, followsUserId } = req.query;

  if (!userId || !followsUserId) {
    return res.status(400).json({ error: "Missing userId or followsUserId." });
  }

  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.followsCollectionId,
      [
        Query.equal("userId", userId as string),
        Query.equal("followsUserId", followsUserId as string),
      ]
    );

    res.status(200).json(response.documents[0] || null);
  } catch (err: any) {
    console.error("Error checking follow status:", err.message);
    res.status(500).json({ error: "Failed to check follow status" });
  }
};

// ============================
// Get User Relationships (Counts)
// ============================
export const getUserRelationships = async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (!userId) return res.status(400).json({ error: "userId required" });

  try {
    const followers = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.followsCollectionId,
      [Query.equal("followsUserId", userId)]
    );

    const following = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.followsCollectionId,
      [Query.equal("userId", userId)]
    );

    res.status(200).json({
      followers: followers.total,
      following: following.total,
    });
  } catch (err: any) {
    console.error("Error fetching relationships:", err.message);
    res.status(500).json({ error: "Failed to fetch relationships" });
  }
};
