import { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";

const UPLOAD_DIR = path.join(__dirname, "../../uploads");

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// ----------------------------- Controllers ----------------------------------

// ✅ Handle single upload (profile pic, cover, etc.)
export async function uploadSingle(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    res.status(201).json({
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: `/uploads/${req.file.filename}`,
    });
  } catch (err) {
    next(err);
  }
}

// ✅ Handle multiple uploads (e.g. post gallery)
export async function uploadMultiple(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.files || !(req.files instanceof Array) || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const files = (req.files as Express.Multer.File[]).map((f) => ({
      filename: f.filename,
      mimetype: f.mimetype,
      size: f.size,
      url: `/uploads/${f.filename}`,
    }));

    res.status(201).json(files);
  } catch (err) {
    next(err);
  }
}

// ✅ Remove uploaded file
export async function removeUpload(req: Request, res: Response, next: NextFunction) {
  try {
    const { filename } = req.params;
    const filePath = path.join(UPLOAD_DIR, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }

    fs.unlinkSync(filePath);
    res.json({ message: "Upload deleted successfully" });
  } catch (err) {
    next(err);
  }
}
