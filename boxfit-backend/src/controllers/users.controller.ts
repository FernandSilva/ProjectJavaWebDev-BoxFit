// src/controllers/users.controller.ts
import { Request, Response, NextFunction } from "express";
import logger from "../logger";
import {
  databases,
  storage,
  APPWRITE,
  ID,
  Query,
  toInputFileFromMulter,
  db,
  ids,
} from "../lib/appwriteClient";

const DB = APPWRITE.databaseId;
const USERS = APPWRITE.collections.users;
const RELS = APPWRITE.collections.relationships;
const POSTS = APPWRITE.collections.posts;
const BUCKET = APPWRITE.bucketId;

const num = (v: unknown, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : d;
};

/** Accepts user doc id OR accountId; returns the user doc id or null. */
async function resolveUserDocId(idOrAccountId?: string): Promise<string | null> {
  if (!idOrAccountId) return null;

  // 1) direct doc id
  try {
    const doc = await databases.getDocument(DB, USERS, idOrAccountId);
    return doc.$id;
  } catch {
    // ignore and fall through
  }

  // 2) fallback by accountId
  try {
    const list = await databases.listDocuments(DB, USERS, [
      Query.equal("accountId", idOrAccountId),
      Query.limit(1),
    ]);
    if (list.total > 0) return list.documents[0].$id;
  } catch {
    // ignore
  }

  return null;
}

// ----------------------------- USERS -----------------------------------------

export async function listUsers(req: Request, res: Response) {
  try {
    const limit = num(req.query.limit, 20);
    const docs = await databases.listDocuments(DB, USERS, [
      Query.orderDesc("$createdAt"),
      Query.limit(limit),
    ]);
    res.json(docs);
  } catch (err: any) {
    (req as any).log?.error({ msg: "users.list.error", err: err?.message });
    res.status(500).json({ error: "Failed to list users" });
  }
}

export async function getUserById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    if (!id) {
      console.warn("[getUserById] ❌ Missing ID param");
      return res.status(400).json({ error: "Missing user ID" });
    }

    // 1. Try to get user by document ID
    try {
      const doc = await db.getDocument(ids.databaseId, ids.usersCollectionId, id);
      console.log("✅ getUserById: User found by doc ID:", doc.$id);
      return res.json(doc);
    } catch (err) {
      console.warn(`[getUserById] ⚠️ No user found by doc ID: ${id}`);
    }

    // 2. Fallback to search by accountId
    try {
      const results = await db.listDocuments(ids.databaseId, ids.usersCollectionId, [
        Query.equal("accountId", id),
        Query.limit(1),
      ]);

      if (results.total > 0) {
        console.log("✅ getUserById: User found by accountId:", results.documents[0].$id);
        return res.json(results.documents[0]);
      } else {
        console.warn(`[getUserById] ❌ No user found with accountId: ${id}`);
        return res.status(404).json({ error: "User not found" });
      }
    } catch (err: any) {
      console.error("❌ getUserById failed in accountId fallback", err.message || err);
      return res.status(500).json({ error: "Failed to retrieve user by accountId" });
    }
  } catch (err) {
    console.error("❌ getUserById unexpected error:", err);
    next(err);
  }
}


export async function getUserByAccountId(req: Request, res: Response) {
  try {
    const { accountId } = req.params;

    if (!accountId) {
      return res.status(400).json({ error: "Missing accountId param." });
    }

    const result = await databases.listDocuments(DB, USERS, [
      Query.equal("accountId", accountId),
      Query.limit(1),
    ]);

    if (!result.total) {
      return res.status(404).json({ error: "No user found for given accountId." });
    }

    return res.json(result.documents[0]);
  } catch (err: any) {
    console.error("❌ getUserByAccountId error:", err.message || err);
    return res.status(500).json({ error: "Failed to fetch user by accountId." });
  }
}

export async function updateUser(req: Request, res: Response) {
  try {
    const userIdInput = String(req.params.id || "").trim();
    if (!userIdInput) return res.status(400).json({ error: "id is required" });

    const resolved = await resolveUserDocId(userIdInput);
    const userId = resolved || userIdInput;

    const { name, bio, imageId: oldImageId } = (req.body || {}) as {
      name?: string;
      bio?: string;
      imageId?: string;
    };

    let newImageId: string | undefined;
    let newImageUrl: string | undefined;

    if (req.file) {
      const input = await toInputFileFromMulter(req.file);
      const created = await storage.createFile(BUCKET, ID.unique(), input as any);
      newImageId = created.$id;
      newImageUrl = String(storage.getFileDownload(BUCKET, newImageId));
    }

    const payload: Record<string, any> = {};
    if (name !== undefined) payload.name = name;
    if (bio !== undefined) payload.bio = bio;
    if (newImageId && newImageUrl) {
      payload.imageId = newImageId;
      payload.imageUrl = newImageUrl;
    }

    const updated = await databases.updateDocument(DB, USERS, userId, payload);

    if (oldImageId && newImageId && oldImageId !== newImageId) {
      storage
        .deleteFile(BUCKET, oldImageId)
        .catch(() => logger.warn({ msg: "avatar.delete.old.failed", oldImageId }));
    }

    res.json(updated);
  } catch (err: any) {
    (req as any).log?.error({ msg: "users.update.error", err: err?.message });
    res.status(500).json({ error: "Failed to update user" });
  }
}

// -------------------------- RELATIONSHIPS ------------------------------------

export async function getRelationshipsCount(req: Request, res: Response) {
  try {
    const docId = await resolveUserDocId(req.params.id);
    if (!docId) return res.json({ followers: 0, following: 0 });

    const [followers, following] = await Promise.all([
      databases.listDocuments(DB, RELS, [Query.equal("followsUserId", docId)]),
      databases.listDocuments(DB, RELS, [Query.equal("userId", docId)]),
    ]);

    res.json({ followers: followers.total, following: following.total });
  } catch (err: any) {
    (req as any).log?.warn({ msg: "relationships.count.error", err: err?.message });
    res.status(500).json({ error: "Failed to fetch relationships" });
  }
}

export async function getRelationshipsList(req: Request, res: Response) {
  try {
    const docId = await resolveUserDocId(req.params.id);
    if (!docId) return res.json([]);

    const rels = await databases.listDocuments(DB, RELS, [Query.equal("userId", docId)]);
    const ids = rels.documents.map((d: any) => d.followsUserId);
    const users = await Promise.all(
      ids.map((id: string) => databases.getDocument(DB, USERS, id))
    );
    res.json(users);
  } catch (err: any) {
    (req as any).log?.warn({ msg: "relationships.list.error", err: err?.message });
    res.status(500).json({ error: "Failed to fetch following list" });
  }
}

export async function getFollowersList(req: Request, res: Response) {
  try {
    const docId = await resolveUserDocId(req.params.id);
    if (!docId) return res.json([]);

    const rels = await databases.listDocuments(DB, RELS, [Query.equal("followsUserId", docId)]);
    const ids = rels.documents.map((d: any) => d.userId);
    const users = await Promise.all(
      ids.map((id: string) => databases.getDocument(DB, USERS, id))
    );
    res.json(users);
  } catch (err: any) {
    (req as any).log?.warn({ msg: "relationships.followers.error", err: err?.message });
    res.status(500).json({ error: "Failed to fetch followers list" });
  }
}

export async function followUser(req: Request, res: Response) {
  try {
    const { userId, followsUserId } = (req.body || {}) as {
      userId?: string;
      followsUserId?: string;
    };
    if (!userId || !followsUserId) {
      return res.status(400).json({ error: "userId and followsUserId are required" });
    }

    const existing = await databases.listDocuments(DB, RELS, [
      Query.equal("userId", userId),
      Query.equal("followsUserId", followsUserId),
      Query.limit(1),
    ]);
    if (existing.total > 0) return res.status(200).json(existing.documents[0]);

    const doc = await databases.createDocument(DB, RELS, ID.unique(), { userId, followsUserId });
    res.status(201).json(doc);
  } catch (err: any) {
    (req as any).log?.error({ msg: "relationships.follow.error", err: err?.message });
    res.status(500).json({ error: "Failed to follow user" });
  }
}

export async function unfollowByDocId(req: Request, res: Response) {
  try {
    const id = String(req.params.docId || "").trim();
    if (!id) return res.status(400).json({ error: "docId is required" });

    await databases.deleteDocument(DB, RELS, id);
    res.status(204).end();
  } catch {
    res.status(404).json({ error: "Relationship not found" });
  }
}

export async function unfollowByPair(req: Request, res: Response) {
  try {
    const q = (req.query || {}) as any;
    const userId = String(q.userId || "").trim();
    const followsUserId = String(q.followsUserId || "").trim();
    if (!userId || !followsUserId) {
      return res.status(400).json({ error: "userId and followsUserId are required" });
    }

    const found = await databases.listDocuments(DB, RELS, [
      Query.equal("userId", userId),
      Query.equal("followsUserId", followsUserId),
      Query.limit(1),
    ]);
    if (!found.total) return res.status(404).json({ error: "Relationship not found" });

    await databases.deleteDocument(DB, RELS, found.documents[0].$id);
    res.status(204).end();
  } catch (err: any) {
    (req as any).log?.error({ msg: "relationships.unfollow.error", err: err?.message });
    res.status(500).json({ error: "Failed to unfollow user" });
  }
}

export async function checkFollowStatus(req: Request, res: Response) {
  try {
    const rawUserId = (req.query as any).userId as string | undefined;
    const rawFollowsId = (req.query as any).followsUserId as string | undefined;

    if (rawUserId && rawFollowsId && rawUserId === rawFollowsId) {
      return res.json(null);
    }

    const userId = await resolveUserDocId(rawUserId || "");
    const followsUserId = await resolveUserDocId(rawFollowsId || "");
    if (!userId || !followsUserId) return res.json(null);

    const existing = await databases.listDocuments(DB, RELS, [
      Query.equal("userId", userId),
      Query.equal("followsUserId", followsUserId),
      Query.limit(1),
    ]);
    res.json(existing.total > 0 ? existing.documents[0] : null);
  } catch (err: any) {
    (req as any).log?.error({ msg: "relationships.check.error", err: err?.message });
    res.status(500).json({ error: "Failed to check follow status" });
  }
}

// ----------------------- SEARCH & ANALYTICS ----------------------------------

export async function searchUsers(req: Request, res: Response) {
  try {
    const q = String(req.query.q || "").trim().toLowerCase();
    if (!q) return res.json({ documents: [] });

    const [byName, byUsername] = await Promise.all([
      databases.listDocuments(DB, USERS, [Query.search("name", q)]),
      databases.listDocuments(DB, USERS, [Query.search("username", q)]),
    ]);

    const map = new Map<string, any>();
    [...byName.documents, ...byUsername.documents].forEach((d: any) => map.set(d.$id, d));
    res.json({ documents: Array.from(map.values()) });
  } catch (err: any) {
    (req as any).log?.error({ msg: "users.search.error", err: err?.message });
    res.status(500).json({ error: "User search failed" });
  }
}

export async function getTopMembers(_req: Request, res: Response) {
  try {
    const [users, rels] = await Promise.all([
      databases.listDocuments(DB, USERS),
      databases.listDocuments(DB, RELS),
    ]);

    const followerCounts: Record<string, number> = {};
    rels.documents.forEach((r: any) => {
      const fid = String(r.followsUserId || "");
      if (!fid) return;
      followerCounts[fid] = (followerCounts[fid] || 0) + 1;
    });

    const enriched = users.documents
      .map((u: any) => ({
        ...u,
        score: (u.liked?.length || 0) + (followerCounts[u.$id] || 0),
      }))
      .filter((u: any) => u.score > 0)
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 10);

    res.json(enriched);
  } catch (err: any) {
    (_req as any).log?.error({ msg: "users.top.error", err: err?.message });
    res.status(500).json({ error: "Failed to compute top growers" });
  }
}

export async function getUserTotalLikes(req: Request, res: Response) {
  try {
    const input = String(req.params.id || "").trim();
    if (!input) return res.status(400).json({ error: "id is required" });

    const docId = (await resolveUserDocId(input)) || input;
    const posts = await databases.listDocuments(DB, POSTS, [Query.equal("creator", docId)]);
    const total = posts.documents.reduce(
      (sum: number, p: any) => sum + (Array.isArray(p.likes) ? p.likes.length : 0),
      0
    );
    res.json({ totalLikes: total });
  } catch (err: any) {
    (req as any).log?.error({ msg: "users.likes.error", err: err?.message });
    res.status(500).json({ error: "Failed to compute total likes" });
  }
}
