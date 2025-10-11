import { Request, Response, NextFunction } from "express";
import Post from "../models/Post";
import Comment from "../models/Comment";

/**
 * Toggle like on a post by userId.
 * - If user already liked -> unlike (pull).
 * - Else -> like (addToSet).
 * Returns: { liked, likesCount, post }
 */
export const likePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    if (!postId || !userId) {
      return res.status(400).json({ message: "postId and userId are required" });
    }

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const already = (post.likes || []).some((id: string) => String(id) === String(userId));

    let updated;
    let liked: boolean;

    if (already) {
      updated = await Post.findByIdAndUpdate(
        postId,
        { $pull: { likes: userId } },
        { new: true }
      ).lean();
      liked = false;
    } else {
      updated = await Post.findByIdAndUpdate(
        postId,
        { $addToSet: { likes: userId } },
        { new: true }
      ).lean();
      liked = true;
    }

    return res.status(200).json({
      liked,
      likesCount: (updated?.likes || []).length,
      post: updated,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * (Optional explicit unlike endpoint if you keep it around)
 */
export const unlikePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    if (!postId || !userId) {
      return res.status(400).json({ message: "postId and userId are required" });
    }

    const updated = await Post.findByIdAndUpdate(
      postId,
      { $pull: { likes: userId } },
      { new: true }
    ).lean();

    if (!updated) return res.status(404).json({ message: "Post not found" });

    return res.status(200).json({
      liked: false,
      likesCount: (updated.likes || []).length,
      post: updated,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get posts a user has liked.
 * Uses Post.likes array so you don't need a separate Like collection.
 */
export const getLikedPostsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    // Find all posts where the likes array contains this userId
    const posts = await Post.find({ likes: userId })
      .populate("userId", "name username imageUrl") // optional
      .sort({ createdAt: -1 });

    if (!posts || posts.length === 0) {
      return res.status(200).json({ posts: [] });
    }

    // Normalize image URLs
    const normalized = posts.map((p) => ({
      ...p._doc,
      imageUrl:
        Array.isArray(p.imageUrl) && p.imageUrl.length > 0
          ? p.imageUrl.map((img) =>
              img.startsWith("http")
                ? img
                : `http://localhost:3001/uploads/${img}`
            )
          : p.imageUrl
          ? `http://localhost:3001/uploads/${p.imageUrl}`
          : null,
    }));

    res.status(200).json({ posts: normalized });
  } catch (error) {
    console.error("❌ getLikedPostsByUser failed:", error);
    res.status(500).json({ error: "Failed to fetch liked posts" });
  }
};

/**
 * Comment like/unlike stays as-is (works today).
 */
export const likeComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { commentId, userId } = req.body;
    if (!commentId || !userId) {
      return res.status(400).json({ message: "commentId and userId are required" });
    }
    const updated = await Comment.findByIdAndUpdate(
      commentId,
      { $addToSet: { likedBy: userId } },
      { new: true }
    ).lean();

    if (!updated) return res.status(404).json({ message: "Comment not found" });

    return res.status(200).json({ comment: updated });
  } catch (err) {
    next(err);
  }
};

export const unlikeComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { commentId, userId } = req.body;
    if (!commentId || !userId) {
      return res.status(400).json({ message: "commentId and userId are required" });
    }
    const updated = await Comment.findByIdAndUpdate(
      commentId,
      { $pull: { likedBy: userId } },
      { new: true }
    ).lean();

    if (!updated) return res.status(404).json({ message: "Comment not found" });

    return res.status(200).json({ comment: updated });
  } catch (err) {
    next(err);
  }
};

/**
 * (You already had this) Total likes across user's posts + comments.
 * Leaving intact if you rely on it in the UI.
 */
export const getUserTotalLikes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ message: "userId is required" });

    // Count likes on posts the user created
    const postLikesAgg = await Post.aggregate([
      { $match: { userId } },
      { $project: { likesCount: { $size: { $ifNull: ["$likes", []] } } } },
      { $group: { _id: null, total: { $sum: "$likesCount" } } },
    ]);

    // Count likes on comments the user created
    const commentLikesAgg = await Comment.aggregate([
      { $match: { userId } },
      { $project: { likesCount: { $size: { $ifNull: ["$likedBy", []] } } } },
      { $group: { _id: null, total: { $sum: "$likesCount" } } },
    ]);

    const postLikes = postLikesAgg[0]?.total || 0;
    const commentLikes = commentLikesAgg[0]?.total || 0;

    return res.status(200).json({ total: postLikes + commentLikes });
  } catch (err) {
    next(err);
  }
};
