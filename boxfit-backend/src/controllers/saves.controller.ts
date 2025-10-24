import { Request, Response, NextFunction } from "express";
import Save from "../models/Save";
import Post from "../models/Post";
import User from "../models/User";

/**
 * ✅ Save post (toggle)
 */
export const savePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, postId } = req.body;
    if (!userId || !postId) {
      return res.status(400).json({ message: "userId and postId are required" });
    }

    const existing = await Save.findOne({ user: userId, post: postId });
    if (existing) {
      return res.status(200).json({ saved: true, save: existing });
    }

    const save = await Save.create({ user: userId, post: postId });

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $addToSet: { saves: userId } },
      { new: true }
    ).lean();

    return res.status(201).json({ saved: true, save, post: updatedPost });
  } catch (err) {
    console.error("❌ savePost error:", (err as Error).message);
    next(err);
  }
};

/**
 * ✅ Delete saved post
 */
export const deleteSavedPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { saveId } = req.params;
    if (!saveId) return res.status(400).json({ message: "saveId is required" });

    const save = await Save.findById(saveId);
    if (!save) return res.status(404).json({ message: "Save not found" });

    await Save.findByIdAndDelete(saveId);

    await Post.findByIdAndUpdate(
      (save as any).post,
      { $pull: { saves: (save as any).user } },
      { new: true }
    );

    return res.status(200).json({ deleted: true });
  } catch (err) {
    console.error("❌ deleteSavedPost error:", (err as Error).message);
    next(err);
  }
};

/**
 * ✅ Get saved posts by user
 */
export const getSavedPostsByUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    if (!userId)
      return res.status(400).json({ error: "Missing required userId parameter" });

    const saves = await Save.find({ user: userId }).lean();

    if (!saves.length) return res.status(200).json({ documents: [] });

    const postIds = saves.map((s) => (s as any).post);
    const posts = await Post.find({ _id: { $in: postIds } })
      .populate("creator", "name username imageUrl _id")
      .sort({ createdAt: -1 })
      .lean();

    const saveMap = Object.fromEntries(
      saves.map((s) => [String((s as any).post), String(s._id)])
    );

    const enriched = posts.map((p) => ({
      ...p,
      _saveId: saveMap[String(p._id)] || null,
    }));

    return res.status(200).json({ documents: enriched });
  } catch (err: any) {
    console.error("❌ getSavedPostsByUser error:", err.message);
    next(err);
  }
};
