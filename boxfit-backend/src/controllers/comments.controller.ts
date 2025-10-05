import { Request, Response, NextFunction } from "express";
import Comment from "../models/Comment";
import Post from "../models/Post";
import User from "../models/User";

// ----------------------------- Controllers ----------------------------------

// ✅ Get comments for a post
export async function getCommentsByPostId(req: Request, res: Response, next: NextFunction) {
  try {
    const { postId } = req.params;
    if (!postId) return res.status(400).json({ error: "postId is required" });

    const limit = Number(req.query.limit) || 20;
    const comments = await Comment.find({ postId }).sort({ createdAt: -1 }).limit(limit).lean();

    res.json({ comments, totalComments: await Comment.countDocuments({ postId }) });
  } catch (err) {
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

    const comment = new Comment({
      postId,
      userId,
      text,
      userImageUrl,
      userName,
    });

    await comment.save();

    // Link comment ID into post for easy lookup (optional but keeps parity with old logic)
    await Post.findByIdAndUpdate(postId, { $push: { comments: String(comment._id) } });

    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
}

// ✅ Like comment
export async function likeComment(req: Request, res: Response, next: NextFunction) {
  try {
    const { commentId, userId } = req.body;
    if (!commentId || !userId) {
      return res.status(400).json({ error: "commentId and userId required" });
    }

    const updated = await Comment.findByIdAndUpdate(
      commentId,
      { $addToSet: { likes: userId } },
      { new: true }
    ).lean();

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

// ✅ Unlike comment
export async function unlikeComment(req: Request, res: Response, next: NextFunction) {
  try {
    const { commentId, userId } = req.body;
    if (!commentId || !userId) {
      return res.status(400).json({ error: "commentId and userId required" });
    }

    const updated = await Comment.findByIdAndUpdate(
      commentId,
      { $pull: { likes: userId } },
      { new: true }
    ).lean();

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

// ✅ Delete comment
export async function deleteComment(req: Request, res: Response, next: NextFunction) {
  try {
    const { commentId } = req.params;
    if (!commentId) return res.status(400).json({ error: "commentId required" });

    const deleted = await Comment.findByIdAndDelete(commentId).lean();

    // Also remove from associated post’s comments array
    if (deleted) {
      await Post.findByIdAndUpdate(deleted.postId, { $pull: { comments: String(deleted._id) } });
    }

    res.json({ message: "Comment deleted" });
  } catch (err) {
    next(err);
  }
}
