import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import User from "../models/User";
import Follow from "../models/Follow";
import Post from "../models/Post";

/* ================================================================
   Helper – Resolve valid Mongo ObjectId for user
================================================================ */
async function resolveUserDocId(idOrAccountId?: string): Promise<string | null> {
  if (!idOrAccountId) return null;

  if (/^[0-9a-fA-F]{24}$/.test(idOrAccountId)) {
    const doc = await User.findById(idOrAccountId).lean();
    if (doc?._id) return String(doc._id);
  }

  const byAccount = await User.findOne({ accountId: idOrAccountId }).lean();
  return byAccount ? String(byAccount._id) : null;
}

/* ================================================================
   CRUD
================================================================ */
export async function listUsers(req: Request, res: Response) {
  try {
    const limit = Number(req.query.limit) || 20;
    const users = await User.find().sort({ createdAt: -1 }).limit(limit).lean();
    res.json(users);
  } catch (err: any) {
    console.error("❌ listUsers error:", err.message);
    res.status(500).json({ error: "Failed to list users" });
  }
}

export async function getUserById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const docId = await resolveUserDocId(id);
    if (!docId) return res.status(404).json({ error: "User not found" });

    const user = await User.findById(docId).lean();
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err: any) {
    console.error("❌ getUserById error:", err.message);
    res.status(500).json({ error: "Failed to get user" });
  }
}

export async function updateUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, bio } = req.body;
    let { imageUrl } = req.body;

    console.log("➡️ [USER/UPDATE] Incoming body:", req.body);
    console.log("➡️ [USER/UPDATE] Params ID:", id);

    // If the user uploaded a new file via multer
    if (req.file) {
      const filename = req.file.filename;
      const fullUrl = `${req.protocol}://${req.get("host")}/uploads/${filename}`;
      imageUrl = fullUrl;
      console.log("🖼️ [USER/UPDATE] Uploaded file detected:", filename);
    } else if (imageUrl && !imageUrl.startsWith("http")) {
      imageUrl = `${req.protocol}://${req.get("host")}${imageUrl}`;
      console.log("🧩 [USER/UPDATE] Normalized existing imageUrl:", imageUrl);
    }

    const updateFields: any = {};
    if (name) updateFields.name = name;
    if (bio !== undefined) updateFields.bio = bio;
    if (imageUrl) updateFields.imageUrl = imageUrl;

    const updated = await User.findByIdAndUpdate(id, updateFields, { new: true }).lean();
    if (!updated) return res.status(404).json({ error: "User not found" });

    console.log("✅ [USER/UPDATE] Successfully updated user:", updated._id);
    res.json(updated);
  } catch (err: any) {
    console.error("❌ updateUser error:", err.message);
    res.status(500).json({ error: "Failed to update user" });
  }
}

export async function getCurrentUser(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id || req.query.userId;
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err: any) {
    console.error("❌ getCurrentUser error:", err.message);
    res.status(500).json({ error: "Failed to fetch current user" });
  }
}

/* ================================================================
   RELATIONSHIPS + FOLLOWING
================================================================ */
export async function getRelationshipsCount(req: Request, res: Response) {
  try {
    const docId = await resolveUserDocId(req.params.id);
    if (!docId) return res.json({ followers: 0, following: 0 });

    const followers = await Follow.countDocuments({ followsUserId: docId });
    const following = await Follow.countDocuments({ userId: docId });

    res.json({ followers, following });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch relationships count" });
  }
}

export async function getFollowersList(req: Request, res: Response) {
  try {
    const docId = await resolveUserDocId(req.params.id);
    if (!docId) return res.json([]);

    const rels = await Follow.find({ followsUserId: docId }).lean();
    const ids = rels.map((r) => r.userId);
    const users = await User.find({ _id: { $in: ids } }).lean();

    res.json(users);
  } catch (err: any) {
    console.error("❌ getFollowersList error:", err.message);
    res.status(500).json({ error: "Failed to fetch followers list" });
  }
}

export async function getRelationshipsList(req: Request, res: Response) {
  try {
    const docId = await resolveUserDocId(req.params.id);
    if (!docId) return res.json([]);

    const rels = await Follow.find({ userId: docId }).lean();
    const ids = rels.map((r) => r.followsUserId);
    const users = await User.find({ _id: { $in: ids } }).lean();

    res.json(users);
  } catch (err: any) {
    console.error("❌ getRelationshipsList error:", err.message);
    res.status(500).json({ error: "Failed to fetch following list" });
  }
}

export async function followUser(req: Request, res: Response) {
  try {
    const { userId, followsUserId } = req.body;
    if (!userId || !followsUserId)
      return res.status(400).json({ error: "userId and followsUserId required" });

    if (userId === followsUserId)
      return res.status(400).json({ error: "Cannot follow yourself" });

    const existing = await Follow.findOne({ userId, followsUserId }).lean();
    if (existing) return res.status(200).json(existing);

    const rel = await new Follow({ userId, followsUserId }).save();
    res.status(201).json(rel);
  } catch (err: any) {
    console.error("❌ followUser error:", err.message);
    res.status(500).json({ error: "Failed to follow user" });
  }
}

export async function unfollowByPair(req: Request, res: Response) {
  try {
    const { userId, followsUserId } = req.query;
    if (!userId || !followsUserId)
      return res.status(400).json({ error: "Missing userId or followsUserId" });

    await Follow.findOneAndDelete({ userId, followsUserId }).lean();
    res.status(204).end();
  } catch (err: any) {
    console.error("❌ unfollowByPair error:", err.message);
    res.status(500).json({ error: "Failed to unfollow" });
  }
}

export async function checkFollowStatus(req: Request, res: Response) {
  try {
    const { userId, followsUserId } = req.query;
    if (!userId || !followsUserId)
      return res.status(400).json({ error: "Missing parameters" });

    const relation = await Follow.findOne({ userId, followsUserId }).lean();
    res.json({ isFollowing: !!relation });
  } catch (err: any) {
    console.error("❌ checkFollowStatus error:", err.message);
    res.status(500).json({ error: "Failed to check follow status" });
  }
}

/* ================================================================
   SEARCH & ANALYTICS
================================================================ */
export async function searchUsers(req: Request, res: Response) {
  try {
    const q = String(req.query.q || "").trim();
    if (!q) return res.json([]);

    const users = await User.find({
      $or: [{ name: new RegExp(q, "i") }, { username: new RegExp(q, "i") }],
    }).lean();

    res.json(users);
  } catch (err: any) {
    console.error("❌ searchUsers error:", err.message);
    res.status(500).json({ error: "User search failed" });
  }
}

/* ================================================================
   ✅ FIX: Total Likes Route (supports both /likes and /likes/total)
================================================================ */
export async function getUserTotalLikes(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const docId = (await resolveUserDocId(id)) || id;
    const posts = await Post.find({ creator: docId }).lean();

    const totalLikes = posts.reduce((sum, p) => sum + (p.likes?.length || 0), 0);
  res.json(totalLikes);
  } catch (err: any) {
    console.error("❌ getUserTotalLikes error:", err.message);
    res.status(500).json({ error: "Failed to compute total likes" });
  }
}
