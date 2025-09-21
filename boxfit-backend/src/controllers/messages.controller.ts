import { Request, Response } from "express";
import { databases, APPWRITE, ID, Query } from "../lib/appwriteClient";

// Small helpers
function bad(res: Response, msg: string, code = 400) {
  return res.status(code).json({ error: msg });
}
function logErr(prefix: string, err: any) {
  const code = err?.code ?? err?.response?.code;
  const message = err?.message ?? err?.response?.message ?? String(err);
  const type = err?.type ?? err?.name;
  console.error(`[messages] ${prefix}: ${message} (code=${code}, type=${type})`);
}

/** GET /api/messages/thread?userId=&peerId=&limit=50 */
export async function getThread(req: Request, res: Response) {
  const userId = String(req.query.userId || "");
  const peerId = String(req.query.peerId || "");
  const limit = Math.min(Number(req.query.limit || 50), 100);

  if (!userId || !peerId) {
    return bad(res, "userId and peerId are required");
  }

  try {
    const result = await databases.listDocuments(
      APPWRITE.databaseId,
      APPWRITE.collections.messages,
      [
        Query.or([
          Query.and([Query.equal("userId", userId), Query.equal("recipientId", peerId)]),
          Query.and([Query.equal("userId", peerId), Query.equal("recipientId", userId)]),
        ]),
        Query.orderAsc("$createdAt"),
        Query.limit(limit),
      ]
    );
    return res.json(result);
  } catch (err: any) {
    logErr("getThread failed", err);
    return bad(res, "Failed to fetch thread", 500);
  }
}

/** GET /api/messages/contacts?userId=&q= */
export async function listContacts(req: Request, res: Response) {
  const userId = String(req.query.userId || "");
  const q = String(req.query.q || "").trim().toLowerCase();

  if (!userId) return bad(res, "userId is required");

  try {
    // naive version: get all messages involving user, then map peers + last message
    const msgs = await databases.listDocuments(
      APPWRITE.databaseId,
      APPWRITE.collections.messages,
      [
        Query.or([Query.equal("userId", userId), Query.equal("recipientId", userId)]),
        Query.orderDesc("$createdAt"),
        Query.limit(200), // adjust if you need more
      ]
    );

    const lastByPeer: Record<string, any> = {};
    for (const m of msgs.documents) {
      const peer = m.userId === userId ? m.recipientId : m.userId;
      if (!lastByPeer[peer]) lastByPeer[peer] = m;
    }

    // optionally filter by q against cached usernames later; for now return peers & last message
    const contacts = Object.entries(lastByPeer).map(([peerId, lastMessage]) => ({
      peerId,
      lastMessage,
    }));

    return res.json({ documents: contacts });
  } catch (err: any) {
    logErr("listContacts failed", err);
    return bad(res, "Failed to list contacts", 500);
  }
}



/** POST /api/messages  { userId, recipientId, content, username? } */
export async function createMessage(req: Request, res: Response) {
  try {
    // Only pick the fields your Appwrite schema allows
    const raw = req.body || {};
    const userIdStr = String(raw.userId || "").trim();
    const recipientIdStr = String(raw.recipientId || "").trim();
    const contentStr = String(raw.content || "").trim();
    const usernameStr =
      raw.username != null ? String(raw.username).trim() : undefined;

    if (!userIdStr) return res.status(400).json({ error: "userId is required" });
    if (!recipientIdStr) return res.status(400).json({ error: "recipientId is required" });
    if (!contentStr) return res.status(400).json({ error: "content is required" });

    // Appwrite messages schema:
    // - required: content (<=220), userId, recipientId, createdAt
    // - optional: username, updatedAt (if you added it)
    const nowIso = new Date().toISOString();

    const payload: Record<string, any> = {
      userId: userIdStr,
      recipientId: recipientIdStr,
      content: contentStr.slice(0, 220),
      createdAt: nowIso,
      // If your collection has updatedAt, keep the next line; otherwise delete it.
      updatedAt: nowIso,
    };
    if (usernameStr) payload.username = usernameStr;

    // Never pass the request body through—this prevents unknown attribute errors
    const doc = await databases.createDocument(
      APPWRITE.databaseId,
      APPWRITE.collections.messages,
      ID.unique(),
      payload
    );

    return res.status(201).json(doc);
  } catch (err: any) {
    logErr("createMessage failed", err);
    return res.status(500).json({ error: "Failed to create message" });
  }
}




/** PATCH /api/messages/read  { senderId, recipientId }  -> marks messages as read (best-effort) */
export async function markThreadRead(req: Request, res: Response) {
  const { senderId, recipientId } = req.body || {};
  if (!senderId || !recipientId) return bad(res, "senderId and recipientId are required");

  try {
    // Only run if your schema actually has isRead
    const unread = await databases.listDocuments(
      APPWRITE.databaseId,
      APPWRITE.collections.messages,
      [
        Query.equal("userId", String(senderId)),
        Query.equal("recipientId", String(recipientId)),
        Query.equal("isRead", false),
        Query.limit(100),
      ]
    );

    for (const d of unread.documents) {
      try {
        await databases.updateDocument(
          APPWRITE.databaseId,
          APPWRITE.collections.messages,
          d.$id,
          { isRead: true }
        );
      } catch (uerr) {
        logErr(`markThreadRead update ${d.$id} failed`, uerr);
      }
    }

    return res.json({ updated: unread.total });
  } catch (err: any) {
    logErr("markThreadRead failed", err);
    return bad(res, "Failed to mark messages read", 500);
  }
}

/** DELETE /api/messages/:id */
export async function deleteMessage(req: Request, res: Response) {
  const id = String(req.params.id || "");
  if (!id) return bad(res, "id is required");

  try {
    await databases.deleteDocument(APPWRITE.databaseId, APPWRITE.collections.messages, id);
    return res.json({ status: "ok" });
  } catch (err: any) {
    logErr("deleteMessage failed", err);
    return bad(res, "Failed to delete message", 500);
  }
}
