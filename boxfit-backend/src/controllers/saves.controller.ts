import { Request, Response, NextFunction } from "express";
import Save from "../models/Save";
import Post from "../models/Post";
import User from "../models/User";

/**
 * Toggle save:
 * - If a Save doc exists (user,post) -> return saved: true (id for UX).
 * - Else create Save doc AND add userId to Post.saves.
 * Always return { saved, saveId?, post }.
 */
export const savePost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, postId } = req.body;
    if (!userId || !postId) {
      return res.status(400).json({ message: "userId and postId are required" });
    }

    const existing = await Save.findOne({ user: userId, post: postId });
    if (existing) {
      // We keep it idempotent: user can call this again and we still return 'saved'
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
    next(err);
  }
};

/**
 * Unsave by saveId (and keep Post.saves array in sync)
 */
export const deleteSavedPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { saveId } = req.params;
    if (!saveId) return res.status(400).json({ message: "saveId is required" });

    const save = await Save.findById(saveId);
    if (!save) return res.status(404).json({ message: "Save not found" });

    await Save.findByIdAndDelete(saveId);

    await Post.findByIdAndUpdate(
      save.post,
      { $pull: { saves: save.user } },
      { new: true }
    );

    return res.status(200).json({ deleted: true });
  } catch (err) {
    next(err);
  }
};

/**
 * Get posts a user has saved.
 * Returns posts + each post’s `saveId` to make unsave easy from the UI.
 */

export const getSavedPostsByUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    if (!userId)
      return res.status(400).json({ error: "Missing required userId parameter" });

    // 🧩 Find all saved entries for this user
    const saves = await Save.find({ userId }).lean();

    if (!saves.length)
      return res.status(200).json({ documents: [] });

    // 🧩 Extract all post IDs
    const postIds = saves.map((s) => s.postId);

    // 🧩 Fetch posts that were saved
    const posts = await Post.find({ _id: { $in: postIds } })
      .populate("creator", "name username imageUrl _id")
      .sort({ createdAt: -1 })
      .lean();

    // 🧩 Attach corresponding saveId so frontend can unsave easily
    const saveMap = Object.fromEntries(
      saves.map((s) => [String(s.postId), String(s._id)])
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

