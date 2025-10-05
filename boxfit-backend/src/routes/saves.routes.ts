// src/routes/saves.routes.ts
import { Router } from "express";
import {
  savePost,
  getSavedPostsByUser,
  deleteSavedPost,
} from "../controllers/saves.controller";

const router = Router();

// Save a post
router.post("/", savePost);

// Get all saved posts for a user
router.get("/user/:userId", getSavedPostsByUser);

// Delete a saved post by its document ID
router.delete("/:saveId", deleteSavedPost);

export default router;
