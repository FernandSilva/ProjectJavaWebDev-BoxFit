import { Request, Response } from "express";
import Post from "../models/Post";
import Comment from "../models/Comment";
import Like from "../models/Like";
import User from "../models/User";

// ────────────────────────────────
// ✅ Like a Post
// ────────────────────────────────
export const likePost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    if (!postId || !userId)
      return res.status(400).json({ error: "postId and userId required" });

    const existing = await Like.findOne({ post: postId, user: userId });
    if (existing) {
      return res.status(200).json({ message: "Already liked" });
    }

    await Like.create({ post: postId, user: userId });

    await Post.findByIdAndUpdate(postId, { $inc: { likesCount: 1 } });

    return res.status(201).json({ message: "Post liked successfully" });
  } catch (err: any) {
    console.error("❌ likePost error:", err.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// ────────────────────────────────
// ✅ Unlike a Post
// ────────────────────────────────
export const unlikePost = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    const like = await Like.findOneAndDelete({ post: postId, user: userId });

    if (!like) return res.status(404).json({ message: "Like not found" });

    await Post.findByIdAndUpdate(postId, { $inc: { likesCount: -1 } });

    return res.status(200).json({ message: "Like removed successfully" });
  } catch (err: any) {
    console.error("❌ unlikePost error:", err.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// ────────────────────────────────
// ✅ Get all posts liked by a user
// ────────────────────────────────
export const getLikedPostsByUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: "userId required" });

    const likes = await Like.find({ user: userId }).populate("post");
    // ✅ Explicitly cast to any to avoid TS2339
    const likedPosts = likes.map((like: any) => like.post);

    return res.status(200).json({ documents: likedPosts });
  } catch (err: any) {
    console.error("❌ getLikedPostsByUser error:", err.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// ────────────────────────────────
// ✅ Like a Comment
// ────────────────────────────────
export const likeComment = async (req: Request, res: Response) => {
  try {
    const { commentId, userId } = req.body;

    if (!commentId || !userId)
      return res.status(400).json({ error: "commentId and userId required" });

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    const alreadyLiked = comment.likes?.includes(userId);
    if (alreadyLiked) {
      return res.status(200).json({ message: "Already liked" });
    }

    comment.likes?.push(userId);
    await comment.save();

    return res.status(201).json({ message: "Comment liked successfully" });
  } catch (err: any) {
    console.error("❌ likeComment error:", err.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// ────────────────────────────────
// ✅ Unlike a Comment
// ────────────────────────────────
export const unlikeComment = async (req: Request, res: Response) => {
  try {
    const { commentId, userId } = req.body;

    if (!commentId || !userId)
      return res.status(400).json({ error: "commentId and userId required" });

    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    comment.likes = comment.likes?.filter(
      (id: string) => String(id) !== String(userId)
    );

    await comment.save();

    return res.status(200).json({ message: "Comment unliked successfully" });
  } catch (err: any) {
    console.error("❌ unlikeComment error:", err.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// ────────────────────────────────
// ✅ Get total likes for a user
// ────────────────────────────────
export const getUserTotalLikes = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: "userId required" });

    const userPosts = await Post.find({ creator: userId }).lean();

    // ✅ Cast post as any to access dynamic field
    const totalLikes = userPosts.reduce(
      (sum, post: any) => sum + (post.likesCount || 0),
      0
    );

    return res.status(200).json({ totalLikes });
  } catch (err: any) {
    console.error("❌ getUserTotalLikes error:", err.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
