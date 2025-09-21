// src/controllers/posts.controller.ts
import { Request, Response, NextFunction } from "express";
import { ID, Query } from "node-appwrite";
import { databases as db, storage, ids } from "../lib/appwriteClient";
import axios from "axios";
import FormData from "form-data";
import { Readable } from "stream";



const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT!;
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY!;
const PROJECT_ID = process.env.APPWRITE_PROJECT_ID!;
const BUCKET_ID = ids.bucketId;

function getFilesFromRequest(req: Request): Express.Multer.File[] {
  const raw: any = (req as any).files;
  const files: Express.Multer.File[] = [];

  const add = (entry: any) => {
    if (Array.isArray(entry)) {
      for (const file of entry) {
        if (file && typeof file === "object" && file.size !== undefined) {
          files.push(file);
        }
      }
    }
  };

  if (Array.isArray(raw)) add(raw);
  else if (typeof raw === "object") {
    for (const value of Object.values(raw)) add(value);
  }

  return files;
}

async function uploadFiles(
  files: Array<Express.Multer.File | undefined>
): Promise<Array<{ id: string; url: string; mimeType: string; size: number }>> {
  const list = (files || []).filter(Boolean) as Express.Multer.File[];
  const uploaded = [];

  for (let idx = 0; idx < list.length; idx++) {
    const file = list[idx];
    const form = new FormData();
    const stream = Readable.from(file.buffer);

    form.append("file", stream, {
      filename: file.originalname,
      contentType: file.mimetype,
      knownLength: file.size,
    });

    const response = await axios.post(
      `${APPWRITE_ENDPOINT}/storage/buckets/${BUCKET_ID}/files`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          "X-Appwrite-Project": PROJECT_ID,
          "X-Appwrite-Key": APPWRITE_API_KEY,
        },
        maxBodyLength: Infinity,
      }
    );

    const meta = response.data;
    uploaded.push({
      id: meta.$id,
      url: `${APPWRITE_ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${meta.$id}/view?project=${PROJECT_ID}`,
      mimeType: meta.mimeType || file.mimetype,
      size: meta.sizeOriginal || file.size,
    });
  }

  return uploaded;
}

const deleteFileSafe = async (fileId: string) => {
  try {
    await storage.deleteFile(BUCKET_ID, fileId);
  } catch {}
};

export async function createPost(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId, caption = "" } = req.body;

    const filesArr = getFilesFromRequest(req);
    if (!userId) return res.status(400).json({ error: "userId is required" });
    if (!filesArr.length) return res.status(400).json({ error: "At least one file is required" });

    const uploads = await uploadFiles(filesArr);
    const now = new Date().toISOString();

    const payload = {
      userId,
      caption,
      imageId: uploads.map((u) => u.id),
      imageUrl: uploads.map((u) => u.url),
      likes: [],
      saves: [],
      comments: "",
      referenceId: null,
      relatedId: null,
      creator: userId,
      createdAt: now,
      updatedAt: now,
    };

    const newPost = await db.createDocument({
      databaseId: ids.databaseId,
      collectionId: ids.postsCollectionId,
      documentId: ID.unique(),
      data: payload,
    });

    let creator = null;
    try {
      creator = await db.getDocument({
        databaseId: ids.databaseId,
        collectionId: ids.usersCollectionId,
        documentId: userId,
      });
    } catch (e) {
      console.warn("⚠️ Could not fetch creator:", e.message);
    }

    res.status(201).json({ ...newPost, creator });
  } catch (err) {
    next(err);
  }
}


export async function getPostById(req: Request, res: Response, next: NextFunction) {
  try {
    const post = await db.getDocument(ids.databaseId, ids.postsCollectionId, req.params.id);
    let creator = null;
    try {
      creator = await db.getDocument(ids.databaseId, ids.usersCollectionId, post.creator);
    } catch {}
    res.json({ ...post, creator });
  } catch (err) {
    next(err);
  }
}

export async function listPosts(req: Request, res: Response, next: NextFunction) {
  try {
    const limit = Math.min(parseInt((req.query.limit as string) || "10"), 100);
    const postsList = await db.listDocuments(ids.databaseId, ids.postsCollectionId, [
      Query.orderDesc("$createdAt"),
      Query.limit(limit),
    ]);

    const enrichedPosts = await Promise.all(
      postsList.documents.map(async (post) => {
        try {
          const user = await db.getDocument(ids.databaseId, ids.usersCollectionId, post.creator);
          return { ...post, creator: user };
        } catch {
          return post;
        }
      })
    );

    const last = postsList.documents[postsList.documents.length - 1];
    res.json({ documents: enrichedPosts, nextCursor: last ? last.$id : null });
  } catch (err) {
    next(err);
  }
}

// ✅ Add all remaining exports
export async function getRecentPosts(req: Request, res: Response, next: NextFunction) {
  try {
    const posts = await db.listDocuments(ids.databaseId, ids.postsCollectionId, [
      Query.orderDesc("$createdAt"),
      Query.limit(20),
    ]);
    res.json(posts);
  } catch (err) {
    next(err);
  }
}

export async function getUserPosts(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.params;
    const posts = await db.listDocuments(ids.databaseId, ids.postsCollectionId, [
      Query.equal("creator", userId),
      Query.orderDesc("$createdAt"),
    ]);
    res.json(posts);
  } catch (err) {
    next(err);
  }
}

export async function updatePost(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { caption } = req.body;
    const files = getFilesFromRequest(req);

    const existing = await db.getDocument(ids.databaseId, ids.postsCollectionId, id);
    let imageId = existing.imageId || [];
    let imageUrl = existing.imageUrl || [];

    if (files.length) {
      const uploads = await uploadFiles(files);
      imageId = uploads.map((u) => u.id);
      imageUrl = uploads.map((u) => u.url);
      await Promise.all((existing.imageId || []).map(deleteFileSafe));
    }

    const updated = await db.updateDocument(ids.databaseId, ids.postsCollectionId, id, {
      caption: caption ?? existing.caption,
      imageId,
      imageUrl,
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function deletePost(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const existing = await db.getDocument(ids.databaseId, ids.postsCollectionId, id);
    const imageIds = existing.imageId || [];

    await db.deleteDocument(ids.databaseId, ids.postsCollectionId, id);
    await Promise.all(imageIds.map(deleteFileSafe));

    res.json({ status: "Ok" });
  } catch (err) {
    next(err);
  }
}

export async function likePost(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { likes = [] } = req.body;
    const updated = await db.updateDocument(ids.databaseId, ids.postsCollectionId, id, { likes });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function savePost(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const saved = await db.createDocument(ids.databaseId, ids.savesCollectionId, ID.unique(), {
      user: userId,
      post: id,
    });

    res.status(201).json(saved);
  } catch (err) {
    next(err);
  }
}

export async function deleteSavedPost(req: Request, res: Response, next: NextFunction) {
  try {
    await db.deleteDocument(ids.databaseId, ids.savesCollectionId, req.params.saveId);
    res.json({ status: "Ok" });
  } catch (err) {
    next(err);
  }
}

export async function getFollowingPosts(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: "Missing userId param" });

    const following = await db.listDocuments(ids.databaseId, ids.relationshipsCollectionId, [
      Query.equal("userId", userId),
    ]);

    const followingIds = following.documents.map((doc) => doc.followsUserId);
    if (!followingIds.length) return res.json({ documents: [] });

    const creatorQueries = followingIds.map((id) => Query.equal("creator", id));

    const posts = await db.listDocuments(ids.databaseId, ids.postsCollectionId, [
      ...creatorQueries,
      Query.orderDesc("$createdAt"),
      Query.limit(20),
    ]);

    const enriched = await Promise.all(posts.documents.map(async (post) => {
      try {
        const creator = await db.getDocument(ids.databaseId, ids.usersCollectionId, post.creator);
        return { ...post, creator };
      } catch {
        return post;
      }
    }));

    res.json({ documents: enriched });
  } catch (err) {
    console.error("❌ getFollowingPosts error:", err.message);
    next(err);
  }
}

export async function getFollowersPosts(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: "Missing userId param" });

    const followers = await db.listDocuments(ids.databaseId, ids.relationshipsCollectionId, [
      Query.equal("followsUserId", userId),
    ]);

    const followerIds = followers.documents.map((doc) => doc.userId);
    if (!followerIds.length) return res.json({ documents: [] });

    const creatorQueries = followerIds.map((id) => Query.equal("creator", id));

    const posts = await db.listDocuments(ids.databaseId, ids.postsCollectionId, [
      ...creatorQueries,
      Query.orderDesc("$createdAt"),
      Query.limit(20),
    ]);

    const enriched = await Promise.all(posts.documents.map(async (post) => {
      try {
        const creator = await db.getDocument(ids.databaseId, ids.usersCollectionId, post.creator);
        return { ...post, creator };
      } catch {
        return post;
      }
    }));

    res.json({ documents: enriched });
  } catch (err) {
    console.error("❌ getFollowersPosts error:", err.message);
    next(err);
  }
}
