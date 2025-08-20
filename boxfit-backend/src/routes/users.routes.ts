import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
} from "../controllers/users.controller";

const router = express.Router();

// Get all users
router.get("/", getAllUsers);

// Get single user by ID
router.get("/:userId", getUserById);

// Update user profile (with form-data, including image)
router.put("/:userId", updateUser);

export default router;
