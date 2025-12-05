// src/middleware/upload.ts
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

function extFromMimetype(m: string) {
  if (m === "image/jpeg" || m === "image/jpg") return ".jpg";
  if (m === "image/png") return ".png";
  if (m === "image/webp") return ".webp";
  if (m === "image/gif") return ".gif";
  return ""; // fallback; but we try to keep ext from originalname
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || extFromMimetype(file.mimetype) || "";
    const base = crypto.randomBytes(16).toString("hex");
    cb(null, `${base}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
});
