// src/utils/file.ts
import { ID } from "node-appwrite";
import { storage, appwriteConfig } from "../lib/appwriteConfig";
import axios from "axios";
import FormData from "form-data";
import { Readable } from "stream";

/**
 * Upload a file using Appwrite REST API (not SDK).
 */
export async function uploadFile(file: Express.Multer.File) {
  try {
    const form = new FormData();
    const stream = Readable.from(file.buffer);

    form.append("file", stream, {
      filename: file.originalname,
      contentType: file.mimetype,
      knownLength: file.size,
    });
    form.append("bucketId", appwriteConfig.storageId);
    form.append("fileId", "unique()");

    const res = await axios.post(`${appwriteConfig.endpoint}/storage/files`, form, {
      headers: {
        ...form.getHeaders(),
        "X-Appwrite-Project": appwriteConfig.projectId,
        "X-Appwrite-Key": appwriteConfig.apiKey,
      },
    });

    return res.data;
  } catch (error) {
    console.error("File upload failed:", error);
    return null;
  }
}


/**
 * Deletes a file from Appwrite storage using the file ID.
 */
export async function deleteFile(fileId: string) {
  try {
    await storage.deleteFile(appwriteConfig.storageId, fileId);
  } catch (error) {
    console.error("Failed to delete file:", error);
  }
}

/**
 * Generates a preview URL for an Appwrite-stored file.
 */
export function getFilePreview(fileId: string) {
  return storage.getFilePreview(appwriteConfig.storageId, fileId).href;
}
