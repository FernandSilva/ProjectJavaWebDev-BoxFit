import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import path from "path";
import * as Files from "../controllers/files.controller";

const router = Router();

// Store uploads in /uploads folder
const storage = multer.diskStorage({
  destination: path.join(__dirname, "../../uploads"),
  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
});

// Small async wrapper
const wrap =
  (fn: any) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);

/* ============================================================================
   FILE ROUTES
============================================================================ */

// Upload single file
router.post("/files", upload.single("file"), wrap(Files.uploadFile));

// Upload multiple files
router.post("/files/multiple", upload.array("files", 10), wrap(Files.uploadFiles));

// Get/download file
router.get("/files/:filename", wrap(Files.getFile));

// Delete file
router.delete("/files/:filename", wrap(Files.deleteFile));

export default router;
