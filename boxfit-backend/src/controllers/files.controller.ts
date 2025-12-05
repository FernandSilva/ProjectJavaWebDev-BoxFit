import fs from "fs";
import path from "path";

const UPLOAD_DIR = path.join(__dirname, "../../uploads");

// Ensure uploads folder exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Helper → build absolute file URL
function buildFileUrl(req: any, filename: string) {
  const baseUrl =
    process.env.BACKEND_URL ||
    `${req.protocol}://${req.get("host")}`;
  return `${baseUrl}/uploads/${filename}`;
}

// ----------------------------- Controllers ----------------------------------

// ✅ Upload a single file
export async function uploadFile(req: any, res: any, next: any) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    const url = buildFileUrl(req, req.file.filename);

    res.status(201).json({
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url, // ✅ absolute
    });
  } catch (err) {
    next(err);
  }
}

// ✅ Upload multiple files
export async function uploadFiles(req: any, res: any, next: any) {
  try {
    if (!req.files || !(req.files instanceof Array) || req.files.length === 0) {
      return res.status(400).json({ error: "No files provided" });
    }

    const files = req.files.map((f) => ({
      filename: f.filename,
      mimetype: f.mimetype,
      size: f.size,
      url: buildFileUrl(req, f.filename), // ✅ absolute
    }));

    res.status(201).json(files);
  } catch (err) {
    next(err);
  }
}

// ✅ Serve/download a file
export async function getFile(req: any, res: any, next: any) {
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
export async function deleteFile(req: any, res: any, next: any) {
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
