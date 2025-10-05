// src/controllers/users.controller.ts
import { Request, Response, NextFunction } from "express";
import User from "../models/User";
import Follow from "../models/Follow";
import Post from "../models/Post";

// ----------------------------- Helpers --------------------------------------

/** Resolve either a Mongo _id or legacy accountId into a user document */
async function resolveUserDocId(idOrAccountId?: string): Promise<string | null> {
  if (!idOrAccountId) return null;

  // Try direct document _id
  if (idOrAccountId.match(/^[0-9a-fA-F]{24}$/)) {
    const doc = await User.findById(idOrAccountId).lean();
    if (doc?._id) return String(doc._id);
  }

  // Fallback: lookup by accountId
  const byAccount = await User.findOne({ accountId: idOrAccountId }).lean();
  return byAccount ? String(byAccount._id) : null;
}

// ----------------------------- Users ----------------------------------------

export async function createUser(req: Request, res: Response) {
  try {
    const { accountId, email, name, username, imageUrl } = req.body || {};

    if (!accountId || !email || !name) {
      return res.status(400).json({ error: "accountId, email, and name are required" });
    }

    // Prevent duplicate users by accountId
    const existing = await User.findOne({ accountId }).lean();
    if (existing) return res.status(200).json(existing);

    const user = await User.create({
      accountId,
      email,
      name,
      username: username || email.split("@")[0],
      imageUrl: imageUrl || "",
      bio: "",
      createdAt: new Date(),
    });

    res.status(201).json(user);
  } catch (err: any) {
    console.error("❌ createUser error:", err.message);
    res.status(500).json({ error: "Failed to create user" });
  }
}

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

export async function getUserById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "User ID is required" });

    // ✅ Step 1: Try to resolve ID from either ObjectId or Appwrite accountId
    const docId = await resolveUserDocId(id);

    // ✅ Step 2: If no match, fallback gracefully
    if (!docId) {
      return res.status(200).json({
        $id: id,
        name: "Unknown User",
        username: "unknown",
        email: "",
        imageUrl: "",
        posts: [],
        followers: [],
        following: [],
      });
    }

    // ✅ Step 3: Fetch user using resolved Mongo _id
    const user = await User.findById(docId).populate("posts").lean();

    // ✅ Step 4: Return a consistent safe structure
    if (!user) {
      return res.status(200).json({
        $id: id,
        name: "Unknown User",
        username: "unknown",
        email: "",
        imageUrl: "",
        posts: [],
        followers: [],
        following: [],
      });
    }

    res.status(200).json(user);
  } catch (err: any) {
    console.error("❌ getUserById error:", err.message);
    return res.status(500).json({
      error: err.message || "Failed to retrieve user",
    });
  }
}


export async function getUserByAccountId(req: Request, res: Response) {
  try {
    const { accountId } = req.params;
    if (!accountId) return res.status(400).json({ error: "Missing accountId" });

    const user = await User.findOne({ accountId }).lean();
    if (!user) return res.status(404).json({ error: "No user found for accountId" });

    res.json(user);
  } catch (err: any) {
    console.error("❌ getUserByAccountId error:", err.message);
    res.status(500).json({ error: "Failed to fetch user by accountId" });
  }
}

export async function updateUser(req: Request, res: Response) {
  try {
    const userId = req.params.id;
    const { name, bio } = req.body;

    const payload: any = {};
    if (name !== undefined) payload.name = name;
    if (bio !== undefined) payload.bio = bio;

    if (req.file) {
      payload.imageUrl = `/uploads/${req.file.originalname}`;
      payload.imageId = req.file.originalname;
    }

    const updated = await User.findByIdAndUpdate(userId, payload, { new: true }).lean();
    if (!updated) return res.status(404).json({ error: "User not found" });

    res.json(updated);
  } catch (err: any) {
    console.error("❌ updateUser error:", err.message);
    res.status(500).json({ error: "Failed to update user" });
  }
}

// -------------------------- Relationships -----------------------------------

export async function getRelationshipsCount(req: Request, res: Response) {
  try {
    const docId = await resolveUserDocId(req.params.id);
    if (!docId) return res.json({ followers: 0, following: 0 });

    const followers = await Follow.countDocuments({ followsUserId: docId });
    const following = await Follow.countDocuments({ userId: docId });

    res.json({ followers, following });
  } catch (err: any) {
    console.error("❌ getRelationshipsCount error:", err.message);
    res.status(500).json({ error: "Failed to fetch relationships" });
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

export async function followUser(req: Request, res: Response) {
  try {
    const { userId, followsUserId } = req.body;
    if (!userId || !followsUserId) {
      return res.status(400).json({ error: "userId and followsUserId required" });
    }

    const existing = await Follow.findOne({ userId, followsUserId }).lean();
    if (existing) return res.status(200).json(existing);

    const doc = await new Follow({ userId, followsUserId }).save();
    res.status(201).json(doc);
  } catch (err: any) {
    console.error("❌ followUser error:", err.message);
    res.status(500).json({ error: "Failed to follow user" });
  }
}

export async function unfollowByDocId(req: Request, res: Response) {
  try {
    const id = req.params.docId;
    await Follow.findByIdAndDelete(id);
    res.status(204).end();
  } catch {
    res.status(404).json({ error: "Relationship not found" });
  }
}

export async function unfollowByPair(req: Request, res: Response) {
  try {
    const { userId, followsUserId } = req.query;
    if (!userId || !followsUserId) {
      return res.status(400).json({ error: "userId and followsUserId required" });
    }

    const rel = await Follow.findOneAndDelete({ userId, followsUserId }).lean();
    if (!rel) return res.status(404).json({ error: "Relationship not found" });

    res.status(204).end();
  } catch (err: any) {
    console.error("❌ unfollowByPair error:", err.message);
    res.status(500).json({ error: "Failed to unfollow user" });
  }
}

export async function checkFollowStatus(req: Request, res: Response) {
  try {
    const { userId, followsUserId } = req.query as { userId?: string; followsUserId?: string };
    if (!userId || !followsUserId || userId === followsUserId) {
      return res.json(null);
    }

    const rel = await Follow.findOne({ userId, followsUserId }).lean();
    res.json(rel || null);
  } catch (err: any) {
    console.error("❌ checkFollowStatus error:", err.message);
    res.status(500).json({ error: "Failed to check follow status" });
  }
}

// ----------------------- Search & Analytics ----------------------------------

export async function searchUsers(req: Request, res: Response) {
  try {
    const q = String(req.query.q || "").trim();
    if (!q) return res.json({ documents: [] });

    const users = await User.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { username: { $regex: q, $options: "i" } },
      ],
    }).lean();

    res.json({ documents: users });
  } catch (err: any) {
    console.error("❌ searchUsers error:", err.message);
    res.status(500).json({ error: "User search failed" });
  }
}

export async function getTopMembers(_req: Request, res: Response) {
  try {
    const users = await User.find().lean();
    const rels = await Follow.find().lean();

    const followerCounts: Record<string, number> = {};
    rels.forEach((r) => {
      followerCounts[r.followsUserId] = (followerCounts[r.followsUserId] || 0) + 1;
    });

    const enriched = users
      .map((u) => ({
        ...u,
        score: followerCounts[String(u._id)] || 0,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    res.json(enriched);
  } catch (err: any) {
    console.error("❌ getTopMembers error:", err.message);
    res.status(500).json({ error: "Failed to compute top members" });
  }
}

export async function getUserTotalLikes(req: Request, res: Response) {
  try {
    const input = req.params.id;
    if (!input) return res.status(400).json({ error: "id is required" });

    const docId = (await resolveUserDocId(input)) || input;
    const posts = await Post.find({ creator: docId }).lean();

    const totalLikes = posts.reduce((sum, p) => sum + (p.likes?.length || 0), 0);
    res.json({ totalLikes });
  } catch (err: any) {
    console.error("❌ getUserTotalLikes error:", err.message);
    res.status(500).json({ error: "Failed to compute total likes" });
  }
}
