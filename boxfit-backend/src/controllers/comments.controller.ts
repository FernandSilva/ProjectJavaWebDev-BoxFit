import { Request, Response, NextFunction } from "express";
import Comment from "../models/Comment";
import Post from "../models/Post";

// ✅ Get comments for a post
export async function getCommentsByPostId(req: Request, res: Response, next: NextFunction) {
  try {
    // Support BOTH /comments/post/:postId and /comments/:postId
    const postId = (req.params.postId || req.params.id || "").toString();
    if (!postId || postId === "undefined") {
      return res.status(400).json({ error: "Invalid or missing post ID" });
    }

    const comments = await Comment.find({ postId }).sort({ createdAt: -1 }).lean();
    res.json({ comments: comments || [], totalComments: comments.length });
  } catch (err) {
    console.error("❌ getCommentsByPostId error:", (err as Error).message);
    next(err);
  }
}

// ✅ Create comment
export async function createComment(req: Request, res: Response, next: NextFunction) {
  try {
    const { postId, userId, text, userImageUrl, userName } = req.body;
    if (!postId || !userId || !text) {
      return res.status(400).json({ error: "postId, userId, and text are required" });
    }

    const comment = await new Comment({
      postId,
      userId,
      text,
      userImageUrl,
      userName,
    }).save();

    // Link comment ID into post (optional)
    await Post.findByIdAndUpdate(postId, { $push: { comments: String(comment._id) } });

    res.status(201).json(comment);
  } catch (err) {
    console.error("❌ createComment error:", (err as Error).message);
    next(err);
  }
}

// ✅ Like comment
export async function likeComment(req: Request, res: Response, next: NextFunction) {
  try {
    const { commentId } = req.params;
    const { userId } = req.body;
    if (!commentId || !userId) {
      return res.status(400).json({ error: "commentId and userId required" });
    }

    const updated = await Comment.findByIdAndUpdate(
      commentId,
      { $addToSet: { likes: userId } },
      { new: true }
    ).lean();

    if (!updated) return res.status(404).json({ error: "Comment not found" });
    res.json(updated);
  } catch (err) {
    console.error("❌ likeComment error:", (err as Error).message);
    next(err);
  }
}

// ✅ Unlike comment
export async function unlikeComment(req: Request, res: Response, next: NextFunction) {
  try {
    const { commentId } = req.params;
    const { userId } = req.body;
    if (!commentId || !userId) {
      return res.status(400).json({ error: "commentId and userId required" });
    }

    const updated = await Comment.findByIdAndUpdate(
      commentId,
      { $pull: { likes: userId } },
      { new: true }
    ).lean();

    if (!updated) return res.status(404).json({ error: "Comment not found" });
    res.json(updated);
  } catch (err) {
    console.error("❌ unlikeComment error:", (err as Error).message);
    next(err);
  }
}

// ✅ Delete comment
export async function deleteComment(req: Request, res: Response, next: NextFunction) {
  try {
    const { commentId } = req.params;
    if (!commentId) return res.status(400).json({ error: "commentId required" });

    const deleted = await Comment.findByIdAndDelete(commentId).lean();

    if (deleted) {
      await Post.findByIdAndUpdate(deleted.postId, { $pull: { comments: String(deleted._id) } });
    }

    res.json({ message: "Comment deleted" });
  } catch (err) {
    console.error("❌ deleteComment error:", (err as Error).message);
    next(err);
  }
}
