// src/routes/saves.routes.ts
import { Router } from "express";
import {
  savePost,
  deleteSavedPost,
  getSavedPostsByUser,
} from "../controllers/saves.controller";

const router = Router();

// POST /api/saves
router.post("/", savePost);

// DELETE /api/saves/:saveId
router.delete("/:saveId", deleteSavedPost);

// GET /api/saves/user/:userId
router.get("/user/:userId", getSavedPostsByUser);

export default router;
