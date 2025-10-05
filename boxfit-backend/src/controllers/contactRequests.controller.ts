// src/controllers/contactRequests.controller.ts
import { Request, Response } from "express";
import ContactRequest from "../models/ContactRequest";

// ============================
// Create a contact request
// ============================
export const createContactRequest = async (req: Request, res: Response) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Name, email, and message are required" });
    }

    const newRequest = new ContactRequest({
      name,
      email,
      message,
    });

    const savedRequest = await newRequest.save();
    return res.status(201).json(savedRequest);
  } catch (error: any) {
    console.error("❌ Error creating contact request:", error.message);
    return res.status(500).json({ error: "Failed to create contact request" });
  }
};

// ============================
// Get all contact requests
// ============================
export const getContactRequests = async (_req: Request, res: Response) => {
  try {
    const requests = await ContactRequest.find().sort({ createdAt: -1 });
    return res.status(200).json(requests);
  } catch (error: any) {
    console.error("❌ Error fetching contact requests:", error.message);
    return res.status(500).json({ error: "Failed to fetch contact requests" });
  }
};

// ============================
// Delete a contact request
// ============================
export const deleteContactRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deleted = await ContactRequest.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: "Contact request not found" });
    }

    return res.status(200).json({ message: "Contact request deleted" });
  } catch (error: any) {
    console.error("❌ Error deleting contact request:", error.message);
    return res.status(500).json({ error: "Failed to delete contact request" });
  }
};
