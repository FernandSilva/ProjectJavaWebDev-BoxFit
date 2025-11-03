import { Request, Response, NextFunction } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";

// We’ll store uploaded files in /uploads (local folder) for now.
// In production, swap this for S3, GCP, or GridFS.
const UPLOAD_DIR = path.join(__dirname, "../../uploads");

// Ensure uploads folder exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// ----------------------------- Controllers ----------------------------------

// ✅ Upload a single file
export async function uploadFile(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    res.status(201).json({
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: `/uploads/${req.file.filename}`,
    });
  } catch (err) {
    next(err);
  }
}

// ✅ Upload multiple files
export async function uploadFiles(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.files || !(req.files instanceof Array) || req.files.length === 0) {
      return res.status(400).json({ error: "No files provided" });
    }

    const files = (req.files as Express.Multer.File[]).map((f) => ({
      filename: f.filename,
      mimetype: f.mimetype,
      size: f.size,
      path: `/uploads/${f.filename}`,
    }));

    res.status(201).json(files);
  } catch (err) {
    next(err);
  }
}

// ✅ Serve/download a file
export async function getFile(req: Request, res: Response, next: NextFunction) {
  try {
    const { filename } = req.params;
    const filePath = path.join(UPLOAD_DIR, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }

    res.sendFile(filePath);
  } catch (err) {
    next(err);
  }
}

// ✅ Delete a file
export async function deleteFile(req: Request, res: Response, next: NextFunction) {
  try {
    const { filename } = req.params;
    const filePath = path.join(UPLOAD_DIR, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }

    fs.unlinkSync(filePath);
    res.json({ message: "File deleted successfully" });
  } catch (err) {
    next(err);
  }
}
