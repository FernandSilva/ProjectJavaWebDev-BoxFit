import { Request, Response } from "express";
import { ID, Query } from "node-appwrite";
import { databases } from "../lib/appwriteClient";
import { appwriteConfig } from "../lib/appwriteConfig";

const DB = appwriteConfig.databaseId;
// prefer nested key, fall back to flat alias
const CONTACTS =
  appwriteConfig.collections.contactRequests ||
  appwriteConfig.contactRequestsCollectionId;

// small helpers
const toStr = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const num = (v: unknown, d = 20) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : d;
};
const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

export async function createContactRequest(req: Request, res: Response) {
  try {
    if (!DB || !CONTACTS) {
      return res
        .status(500)
        .json({ error: "Contact requests collection not configured" });
    }

    const name = toStr(req.body?.name);
    const email = toStr(req.body?.email);
    const message = toStr(req.body?.message);

    if (!name || !email || !message) {
      return res
        .status(400)
        .json({ error: "name, email and message are required" });
    }
    if (!isEmail(email)) {
      return res.status(400).json({ error: "Invalid email address" });
    }
    if (message.length > 4000) {
      return res
        .status(400)
        .json({ error: "Message exceeds 4000 characters" });
    }

    const payload = {
      name,
      email,
      message,
      createdAt: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.get("user-agent") || "",
    };

    const doc = await databases.createDocument(DB, CONTACTS, ID.unique(), payload);
    return res.status(201).json(doc);
  } catch (err: any) {
    (req as any).log?.error({
      msg: "contactRequests.create.error",
      err: err?.message,
    });
    return res
      .status(500)
      .json({ error: "Failed to submit contact request" });
  }
}

/**
 * Simple listing (add auth/role checks if needed).
 * Supports: ?limit=20&cursor=<docId>
 */
export async function listContactRequests(req: Request, res: Response) {
  try {
    if (!DB || !CONTACTS) {
      return res
        .status(500)
        .json({ error: "Contact requests collection not configured" });
    }

    const limit = num(req.query.limit, 20);
    const cursor = toStr(req.query.cursor);

    const queries: any[] = [Query.orderDesc("$createdAt"), Query.limit(limit)];
    if (cursor) queries.push(Query.cursorAfter(cursor));

    // Add Query.search(...) here if you later add fulltext indexes.
    const result = await databases.listDocuments(DB, CONTACTS, queries);
    return res.json(result);
  } catch (err: any) {
    (req as any).log?.error({
      msg: "contactRequests.list.error",
      err: err?.message,
    });
    return res.status(500).json({ error: "Failed to list contact requests" });
  }
}
