import { Request, Response } from "express";
import { ID } from "appwrite";
import { Readable } from "stream";
import { storage } from "../lib/appwriteClient";
import { appwriteConfig } from "../lib/appwriteConfig";
import axios from "axios";
import FormData from "form-data";


const { storageId, endpoint, projectId, apiKey } = appwriteConfig;

export const uploadFile = async (req: Request, res: Response) => {
  try {
    const file = req.file;

    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const form = new FormData();
    const stream = Readable.from(file.buffer);

    form.append("file", stream, {
      filename: file.originalname,
      contentType: file.mimetype,
      knownLength: file.size,
    });
    form.append("bucketId", storageId);
    form.append("fileId", "unique()");

    const uploadRes = await axios.post(`${endpoint}/storage/files`, form, {
      headers: {
        ...form.getHeaders(),
        "X-Appwrite-Project": projectId,
        "X-Appwrite-Key": apiKey,
      },
    });

    const uploaded = uploadRes.data;

    return res.status(200).json({ file: uploaded });
  } catch (err: any) {
    console.error("❌ Upload failed:", err.message);
    return res.status(500).json({ error: "Failed to upload file" });
  }
};


export const getFilePreview = async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;

    if (!fileId) {
      return res.status(400).json({ error: "File ID required" });
    }

    const previewUrl = storage.getFilePreview(
      appwriteConfig.storageId,
      fileId
    );

    return res.status(200).json({ previewUrl: previewUrl.toString() });
  } catch (error: any) {
    console.error("❌ Error getting preview:", error.message);
    return res.status(500).json({ error: "Failed to get preview" });
  }
};

export const deleteFile = async (req: Request, res: Response) => {
  try {
    const { fileId } = req.params;

    if (!fileId) {
      return res.status(400).json({ error: "File ID required" });
    }

    await storage.deleteFile(appwriteConfig.storageId, fileId);

    return res.status(200).json({ message: "File deleted successfully" });
  } catch (error: any) {
    console.error("❌ Error deleting file:", error.message);
    return res.status(500).json({ error: "Failed to delete file" });
  }
};
