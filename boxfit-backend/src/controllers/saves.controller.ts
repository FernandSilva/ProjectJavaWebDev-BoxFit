// src/controllers/saves.controller.ts
import { Request, Response } from "express";
import Save from "../models/Save";
import Post from "../models/Post";

// ============================
// Save a post
// ============================
export const savePost = async (req: Request, res: Response) => {
  try {
    const { userId, postId } = req.body;

    if (!userId || !postId) {
      return res.status(400).json({ error: "userId and postId are required" });
    }

    // Prevent duplicates
    const existing = await Save.findOne({ user: userId, post: postId });
    if (existing) {
      return res.status(200).json(existing);
    }

    const newSave = new Save({ user: userId, post: postId });
    const saved = await newSave.save();

    return res.status(201).json(saved);
  } catch (error: any) {
    console.error("❌ Error saving post:", error.message);
    return res.status(500).json({ error: "Failed to save post" });
  }
};

// ============================
// Get saved posts by user
// ============================
export const getSavedPostsByUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const savedPosts = await Save.find({ user: userId })
      .populate("post") // include post details
      .sort({ createdAt: -1 });

    return res.status(200).json(savedPosts);
  } catch (error: any) {
    console.error("❌ Error fetching saved posts:", error.message);
    return res.status(500).json({ error: "Failed to get saved posts" });
  }
};

// ============================
// Delete a saved post
// ============================
export const deleteSavedPost = async (req: Request, res: Response) => {
  try {
    const { saveId } = req.params;

    if (!saveId) {
      return res.status(400).json({ error: "saveId is required" });
    }

    const deleted = await Save.findByIdAndDelete(saveId);
    if (!deleted) {
      return res.status(404).json({ error: "Saved post not found" });
    }

    return res.status(200).json({ message: "Saved post deleted" });
  } catch (error: any) {
    console.error("❌ Error deleting saved post:", error.message);
    return res.status(500).json({ error: "Failed to delete saved post" });
  }
};
