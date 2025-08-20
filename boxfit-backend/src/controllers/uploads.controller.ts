// controllers/uploads.controller.ts
import { Request, Response } from "express";
import { ID, InputFile } from "node-appwrite";
import { storage } from "../lib/appwriteClient";
import { appwriteConfig } from "../lib/appwriteConfig";
import fs from "fs";

export const uploadFile = async (req: Request, res: Response) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const buffer = fs.readFileSync(file.path);
    const inputFile = InputFile.fromBuffer(buffer, file.originalname);

    const result = await storage.createFile(
      appwriteConfig.storageId,
      ID.unique(),
      inputFile
    );

    res.status(200).json({ file: result });
  } catch (error: any) {
    console.error("Upload failed:", error.message);
    res.status(500).json({ error: "Failed to upload file" });
  }
};

export const getFilePreview = async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;

    if (!fileId) {
      return res.status(400).json({ error: "File ID required" });
    }

    const previewUrl = storage.getFilePreview(appwriteConfig.storageId, fileId);

    res.status(200).json({ previewUrl: previewUrl.href });
  } catch (error: any) {
    console.error("Error getting preview:", error.message);
    res.status(500).json({ error: "Failed to get preview" });
  }
};

export const deleteFile = async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;

    if (!fileId) {
      return res.status(400).json({ error: "File ID required" });
    }

    await storage.deleteFile(appwriteConfig.storageId, fileId);

    res.status(200).json({ message: "File deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting file:", error.message);
    res.status(500).json({ error: "Failed to delete file" });
  }
};
