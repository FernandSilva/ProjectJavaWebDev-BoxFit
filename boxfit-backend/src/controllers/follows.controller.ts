import { Request, Response, NextFunction } from "express";
import Follow from "../models/Follow";
import User from "../models/User";

// ----------------------------- Controllers ----------------------------------

// ✅ Follow a user
export async function followUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId, followsUserId } = req.body;
    if (!userId || !followsUserId) {
      return res.status(400).json({ error: "userId and followsUserId are required" });
    }

    if (userId === followsUserId) {
      return res.status(400).json({ error: "You cannot follow yourself" });
    }

    // Check if relationship already exists
    const existing = await Follow.findOne({ userId, followsUserId }).lean();
    if (existing) return res.status(200).json(existing);

    const doc = await new Follow({ userId, followsUserId }).save();
    res.status(201).json(doc);
  } catch (err) {
    next(err);
  }
}

// ✅ Unfollow by relationship ID
export async function unfollowById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Relationship ID is required" });

    await Follow.findByIdAndDelete(id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

// ✅ Unfollow by user pair
export async function unfollowByPair(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId, followsUserId } = req.query;
    if (!userId || !followsUserId) {
      return res.status(400).json({ error: "userId and followsUserId are required" });
    }

    const rel = await Follow.findOneAndDelete({ userId, followsUserId }).lean();
    if (!rel) return res.status(404).json({ error: "Relationship not found" });

    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

// ✅ Get followers of a user
export async function getFollowers(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const rels = await Follow.find({ followsUserId: userId }).lean();
    const ids = rels.map((r) => r.userId);

    const users = await User.find({ _id: { $in: ids } }).lean();
    res.json(users);
  } catch (err) {
    next(err);
  }
}

// ✅ Get users a given user is following
export async function getFollowing(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const rels = await Follow.find({ userId }).lean();
    const ids = rels.map((r) => r.followsUserId);

    const users = await User.find({ _id: { $in: ids } }).lean();
    res.json(users);
  } catch (err) {
    next(err);
  }
}

// ✅ Check if one user follows another
export async function checkFollowStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId, followsUserId } = req.query as { userId?: string; followsUserId?: string };
    if (!userId || !followsUserId) {
      return res.json(null);
    }

    const rel = await Follow.findOne({ userId, followsUserId }).lean();
    res.json(rel || null);
  } catch (err) {
    next(err);
  }
}
