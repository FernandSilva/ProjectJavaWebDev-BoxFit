// src/routes/contactRequests.routes.ts
import { Router } from "express";
import {
  createContactRequest,
  getContactRequests,
  deleteContactRequest,
} from "../controllers/contactRequests.controller";

const router = Router();

// Create a new contact request
router.post("/", createContactRequest);

// Get all contact requests
router.get("/", getContactRequests);

// Delete a contact request by ID
router.delete("/:id", deleteContactRequest);

export default router;
