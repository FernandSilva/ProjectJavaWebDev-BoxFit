// controllers/users.controller.ts

import { Request, Response } from "express";
import { ID, Query } from "node-appwrite";
import { appwriteConfig } from "../lib/appwriteConfig";
import { databases } from "../lib/appwriteClient";
import { deleteFile, getFilePreview, uploadFile } from "../utils/file";
import { UserUpdateSchema } from "../utils/validation";

// ================================
// Get user by ID
// ================================
export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const user = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      id
    );

    return res.status(200).json(user);
  } catch (error: any) {
    console.error("Error getting user by ID:", error.message);
    return res.status(500).json({ error: "Failed to fetch user" });
  }
};

// ================================
// Get all users
// ================================
export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId
    );

    return res.status(200).json(users.documents);
  } catch (error: any) {
    console.error("Error getting users:", error.message);
    return res.status(500).json({ error: "Failed to fetch users" });
  }
};

// ================================
// Update user profile
// ================================
export const updateUser = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const formData = req.body;

  try {
    // Optional image upload
    let imageUrl = "";
    if (req.file) {
      const uploadedFile = await uploadFile(req.file);
      if (!uploadedFile) {
        return res.status(500).json({ error: "Failed to upload file" });
      }

      const fileUrl = getFilePreview(uploadedFile.$id);
      imageUrl = fileUrl;

      // Delete old image if exists
      if (formData.imageId) {
        await deleteFile(formData.imageId);
      }
    }

    // Build updated fields
    const updatedData = {
      ...formData,
      imageUrl: imageUrl || formData.imageUrl,
    };

    const updatedUser = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      userId,
      updatedData
    );

    return res.status(200).json(updatedUser);
  } catch (error: any) {
    console.error("Error updating user:", error.message);
    return res.status(500).json({ error: "Failed to update user" });
  }
};
