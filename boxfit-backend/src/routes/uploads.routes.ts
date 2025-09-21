// routes/uploads.routes.ts
import express from "express";
import multer from "multer";
import { uploadFile } from "../controllers/uploads.controller";


const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/uploads
router.post("/", upload.single("file"), uploadFile);


export default router;
