import fs from "fs";
import path from "path";

const UPLOAD_DIR = path.join(__dirname, "../../uploads");

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Helper to get absolute URL
function buildFileUrl(req: any, filename: string) {
  const baseUrl =
    process.env.BACKEND_URL ||
    `${req.protocol}://${req.get("host")}`;
  return `${baseUrl}/uploads/${filename}`;
}

// ----------------------------- Controllers ----------------------------------

// ✅ Handle single upload (profile pic, cover, etc.)
export async function uploadSingle(req: any, res: any, next: any) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileUrl = buildFileUrl(req, req.file.filename);

    res.status(201).json({
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: fileUrl, // ✅ Absolute URL
    });
  } catch (err) {
    next(err);
  }
}

// ✅ Handle multiple uploads (e.g. post gallery)
export async function uploadMultiple(req: any, res: any, next: any) {
  try {
    if (!req.files || !(req.files instanceof Array) || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const files = req.files.map((f) => ({
      filename: f.filename,
      mimetype: f.mimetype,
      size: f.size,
      url: buildFileUrl(req, f.filename), // ✅ Absolute URL
    }));

    res.status(201).json(files);
  } catch (err) {
    next(err);
  }
}

// ✅ Remove uploaded file
export async function removeUpload(req: any, res: any, next: any) {
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
