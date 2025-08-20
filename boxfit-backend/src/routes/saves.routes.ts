import express from "express";
import { savePost, deleteSavedPost, getSavedPostsByUser } from "../controllers/saves.controller";

const router = express.Router();

// Save a post
router.post("/", savePost);

// Delete a saved post by its document ID
router.delete("/:saveId", deleteSavedPost);

// Get all saved posts for a user
router.get("/user/:userId", getSavedPostsByUser);

export default router;
