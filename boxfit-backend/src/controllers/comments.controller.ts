import { Request, Response, NextFunction } from "express";
import { databases as db, ids } from "../lib/appwriteClient";
import { ID, Query } from "node-appwrite";

const asInt = (v: any, def = 10, max = 100) =>
  Math.min(parseInt(String(v || def), 10) || def, max);

/** GET /comments/post/:postId?limit=5&cursor=<id> */
export async function getCommentsByPostId(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { postId } = req.params;
    const limit = asInt(req.query.limit, 5, 50);
    const cursor = req.query.cursor ? String(req.query.cursor) : undefined;

    const queries: any[] = [
      Query.equal("postId", postId),
      Query.orderAsc("$createdAt"),
      Query.limit(limit),
    ];
    if (cursor) queries.push(Query.cursorAfter(cursor));

    const page = await db.listDocuments(ids.databaseId, ids.commentsCollectionId, queries);
    // Use SDK-reported total when available; otherwise fall back to a tiny count probe.
    const totalProbe = await db.listDocuments(ids.databaseId, ids.commentsCollectionId, [
      Query.equal("postId", postId),
      Query.limit(1),
    ]);
    const totalComments = totalProbe.total ?? page.total ?? page.documents.length;
    const last = page.documents[page.documents.length - 1];

    res.json({
      comments: page.documents,
      totalComments,
      nextCursor: last ? last.$id : null,
    });
  } catch (err) {
    next(err);
  }
}

/** POST /comments */
export async function createComment(req: Request, res: Response, next: NextFunction) {
  try {
    const { postId, userId, text, userImageUrl, userName } = req.body || {};
    if (!postId || !userId || !text?.trim()) {
      return res.status(400).json({ error: "postId, userId and text are required" });
    }

    const created = await db.createDocument(
      ids.databaseId,
      ids.commentsCollectionId,
      ID.unique(),
      {
        postId,
        userId,
        text: String(text),
        userImageUrl: userImageUrl ?? null,
        userName: userName ?? null,
        likedBy: [],
        likes: 0,
        createdAt: new Date().toISOString(),
      }
    );

    req.log?.info({ msg: "comment.created", id: created.$id, postId, userId });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}

/** POST /comments/:id/like  { userId } */
export async function likeComment(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { userId } = req.body || {};
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const doc = await db.getDocument(ids.databaseId, ids.commentsCollectionId, id);
    const likedBy: string[] = Array.isArray(doc.likedBy) ? doc.likedBy : [];
    if (likedBy.includes(userId)) return res.json(doc); // idempotent

    const newLikedBy = [...likedBy, userId];
    const updated = await db.updateDocument(ids.databaseId, ids.commentsCollectionId, id, {
      likedBy: newLikedBy,
      likes: newLikedBy.length,
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

/** POST /comments/:id/unlike  { userId } */
export async function unlikeComment(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { userId } = req.body || {};
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const doc = await db.getDocument(ids.databaseId, ids.commentsCollectionId, id);
    const likedBy: string[] = Array.isArray(doc.likedBy) ? doc.likedBy : [];
    if (!likedBy.includes(userId)) return res.json(doc); // idempotent

    const newLikedBy = likedBy.filter((u) => u !== userId);
    const updated = await db.updateDocument(ids.databaseId, ids.commentsCollectionId, id, {
      likedBy: newLikedBy,
      likes: Math.max(0, newLikedBy.length),
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

/** DELETE /comments/:id */
export async function deleteComment(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    await db.deleteDocument(ids.databaseId, ids.commentsCollectionId, id);
    req.log?.info({ msg: "comment.deleted", id });
    res.json({ status: "Ok" });
  } catch (err) {
    next(err);
  }
}
