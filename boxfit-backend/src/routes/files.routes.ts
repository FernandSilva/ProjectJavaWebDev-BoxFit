// src/routes/files.routes.ts
import { Router } from "express";
import multer from "multer";
import * as FilesController from "../controllers/files.controller";

const router = Router();

// Memory storage is perfect for piping directly to Appwrite
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB per file (tweak if needed)
    files: 20,
  },
});

const wrap =
  (fn: any) =>
  (req: any, res: any, next: any) =>
    Promise.resolve(fn(req, res, next)).catch(next);

/* =============================================================================
   Files
============================================================================= */

// Single file upload: field "file"
router.post("/files", upload.single("file"), wrap(FilesController.uploadSingleFile));

// Multiple files upload: field "files"
router.post("/files/batch", upload.array("files"), wrap(FilesController.uploadMultipleFiles));

// File previews for many ids
router.post("/files/previews", wrap(FilesController.listPreviews));

// File metadata + url
router.get("/files/:id", wrap(FilesController.getFile));

// URL only
router.get("/files/:id/url", wrap(FilesController.getFileUrlOnly));

// Delete file
router.delete("/files/:id", wrap(FilesController.deleteFile));

export default router;
