import { Request, Response, NextFunction } from "express";
import Post from "../models/Post";
import Comment from "../models/Comment";

// ----------------------------- Likes ----------------------------------------

// ✅ Like a post
export async function likePost(req: Request, res: Response, next: NextFunction) {
  try {
    const { postId, userId } = req.body;
    if (!postId || !userId) {
      return res.status(400).json({ error: "postId and userId are required" });
    }

    const updated = await Post.findByIdAndUpdate(
      postId,
      { $addToSet: { likes: userId } },
      { new: true }
    ).lean();

    if (!updated) return res.status(404).json({ error: "Post not found" });

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

// ✅ Unlike a post
export async function unlikePost(req: Request, res: Response, next: NextFunction) {
  try {
    const { postId, userId } = req.body;
    if (!postId || !userId) {
      return res.status(400).json({ error: "postId and userId are required" });
    }

    const updated = await Post.findByIdAndUpdate(
      postId,
      { $pull: { likes: userId } },
      { new: true }
    ).lean();

    if (!updated) return res.status(404).json({ error: "Post not found" });

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

// ✅ Like a comment
export async function likeComment(req: Request, res: Response, next: NextFunction) {
  try {
    const { commentId, userId } = req.body;
    if (!commentId || !userId) {
      return res.status(400).json({ error: "commentId and userId are required" });
    }

    const updated = await Comment.findByIdAndUpdate(
      commentId,
      { $addToSet: { likes: userId } },
      { new: true }
    ).lean();

    if (!updated) return res.status(404).json({ error: "Comment not found" });

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

// ✅ Unlike a comment
export async function unlikeComment(req: Request, res: Response, next: NextFunction) {
  try {
    const { commentId, userId } = req.body;
    if (!commentId || !userId) {
      return res.status(400).json({ error: "commentId and userId are required" });
    }

    const updated = await Comment.findByIdAndUpdate(
      commentId,
      { $pull: { likes: userId } },
      { new: true }
    ).lean();

    if (!updated) return res.status(404).json({ error: "Comment not found" });

    res.json(updated);
  } catch (err) {
    next(err);
  }
}
