// src/controllers/files.controller.ts
import { Request, Response } from "express";
import { ID } from "node-appwrite";
import logger from "../logger";
import { APPWRITE, storage, toInputFileFromMulter } from "../lib/appwriteClient";

const BUCKET = APPWRITE.bucketId;

// Helpers
const okBucket = () => Boolean(BUCKET);
const fileUrl = (id: string) => String(storage.getFileDownload(BUCKET, id));



export async function uploadSingleFile(req: Request, res: Response) {
  try {
    // ...
    if (!req.file) {
      return res.status(400).json({ error: 'Missing file. Expected field "file".' });
    }

    const input = await toInputFileFromMulter(req.file); // <-- await
    const created = await storage.createFile(BUCKET, ID.unique(), input as any);

    // ...
  } catch (err: any) {
    // ...
  }
}

export async function uploadMultipleFiles(req: Request, res: Response) {
  try {
    if (!okBucket()) {
      return res.status(500).json({ error: "Storage bucket not configured" });
    }

    // ✅ define and type the files from Multer
    const files = (req.files as Express.Multer.File[]) || [];
    if (!files.length) {
      return res.status(400).json({ error: 'No files found. Expected field "files".' });
    }

    const results = await Promise.all(
      files.map(async (f, idx) => {
        const input = await toInputFileFromMulter(f); // <-- await (helper is async)
        (req as any).log?.info?.({
          msg: "files.upload.input.debug",
          idx,
          name: f.originalname,
          inputHasSize: typeof (input as any)?.size === "number",
          inputHasStream: Boolean((input as any)?.stream),
          inputCtor: (input as any)?.constructor?.name || typeof input,
        });

        const created = await storage.createFile(BUCKET, ID.unique(), input as any);
        return {
          $id: created.$id,
          name: created.name,
          mimeType: created.mimeType,
          sizeOriginal: created.sizeOriginal,
          url: fileUrl(created.$id),
        };
      })
    );

    return res.status(201).json(results);
  } catch (err: any) {
    (req as any).log?.error({ msg: "files.upload.batch.error", err: err?.message });
    return res.status(500).json({ error: "Failed to upload files" });
  }
}



/**
 * GET /files/:id  -> metadata + url
 */
export async function getFile(req: Request, res: Response) {
  const id = req.params.id;
  try {
    if (!okBucket()) {
      return res.status(500).json({ error: "Storage bucket not configured" });
    }
    const meta = await storage.getFile(BUCKET, id);
    return res.json({
      ...meta,
      url: fileUrl(id),
    });
  } catch (err: any) {
    (req as any).log?.warn({ msg: "files.get.error", id, err: err?.message });
    return res.status(404).json({ error: "File not found" });
  }
}

/**
 * GET /files/:id/url  -> { url }
 */
export async function getFileUrlOnly(req: Request, res: Response) {
  const id = req.params.id;
  try {
    if (!okBucket()) {
      return res.status(500).json({ error: "Storage bucket not configured" });
    }
    await storage.getFile(BUCKET, id); // existence probe
    return res.json({ url: fileUrl(id) });
  } catch (err: any) {
    (req as any).log?.warn({ msg: "files.url.error", id, err: err?.message });
    return res.status(404).json({ error: "File not found" });
  }
}

/**
 * POST /files/previews
 * Body: { ids: string[] }
 * Returns: [{ id, url, mimeType, sizeOriginal }]
 */
export async function listPreviews(req: Request, res: Response) {
  try {
    if (!okBucket()) {
      return res.status(500).json({ error: "Storage bucket not configured" });
    }
    const ids = Array.isArray(req.body?.ids) ? (req.body.ids as string[]) : [];
    if (!ids.length) {
      return res.status(400).json({ error: "ids array is required" });
    }

    const results = await Promise.all(
      ids.map(async (id) => {
        try {
          const meta = await storage.getFile(BUCKET, id);
          return {
            id,
            url: fileUrl(id),
            mimeType: meta.mimeType,
            sizeOriginal: meta.sizeOriginal,
          };
        } catch {
          return { id, error: "not_found" };
        }
      })
    );

    return res.json(results);
  } catch (err: any) {
    (req as any).log?.error({ msg: "files.previews.error", err: err?.message });
    return res.status(500).json({ error: "Failed to fetch previews" });
  }
}

/**
 * DELETE /files/:id
 */
export async function deleteFile(req: Request, res: Response) {
  const id = req.params.id;
  try {
    if (!okBucket()) {
      return res.status(500).json({ error: "Storage bucket not configured" });
    }
    await storage.deleteFile(BUCKET, id);
    return res.status(204).end();
  } catch (err: any) {
    (req as any).log?.warn({ msg: "files.delete.error", id, err: err?.message });
    return res.status(404).json({ error: "File not found" });
  }
}
