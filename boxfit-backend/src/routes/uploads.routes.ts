import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import path from "path";
import * as Uploads from "../controllers/uploads.controller";

const router = Router();

// Multer storage config
const storage = multer.diskStorage({
  destination: path.join(__dirname, "../../uploads"),
  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
});

// Wrapper
const wrap =
  (fn: any) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);

/* ============================================================================
   UPLOAD ROUTES
============================================================================ */

// Single file (e.g. profile pic)
router.post("/uploads/single", upload.single("file"), wrap(Uploads.uploadSingle));

// Multiple files (e.g. post gallery)
router.post("/uploads/multiple", upload.array("files", 10), wrap(Uploads.uploadMultiple));

// Delete an uploaded file
router.delete("/uploads/:filename", wrap(Uploads.removeUpload));

export default router;
