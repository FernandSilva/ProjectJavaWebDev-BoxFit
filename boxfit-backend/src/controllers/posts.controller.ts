import { Request, Response, NextFunction } from "express";
import Post from "../models/Post";
import User from "../models/User";
import Follow from "../models/Follow";

// ----------------------------- Helpers --------------------------------------

function getFilesFromRequest(req: Request): Express.Multer.File[] {
  const raw: any = (req as any).files;
  const files: Express.Multer.File[] = [];
  const add = (entry: any) => {
    if (Array.isArray(entry)) {
      for (const f of entry) {
        if (f && typeof f === "object" && f.size !== undefined) files.push(f);
      }
    }
  };
  if (Array.isArray(raw)) add(raw);
  else if (typeof raw === "object") Object.values(raw).forEach(add);
  return files;
}

// ----------------------------- Controllers ----------------------------------

// ✅ Create Post
export async function createPost(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId, caption = "" } = req.body;
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const filesArr = getFilesFromRequest(req);
    if (!filesArr.length) return res.status(400).json({ error: "At least one file is required" });

    // For now: save filename as imageId, and build local URL
    const imageUrl = filesArr.map((f) => `/uploads/${f.originalname}`);
    const imageId = filesArr.map((f) => f.originalname);

    const post = new Post({
      userId,
      caption,
      imageUrl,
      imageId,
      likes: [],
      saves: [],
      comments: [],
      creator: userId,
    });

    await post.save();

    const creator = await User.findById(userId).lean();
    res.status(201).json({ ...post.toObject(), creator });
  } catch (err) {
    next(err);
  }
}

// ✅ Get Post by ID
export async function getPostById(req: Request, res: Response, next: NextFunction) {
  try {
    const post = await Post.findById(req.params.id).lean();
    if (!post) return res.status(404).json({ error: "Post not found" });

    const creator = await User.findById(post.creator).lean();
    res.json({ ...post, creator });
  } catch (err) {
    next(err);
  }
}

// ✅ List Posts
export async function listPosts(req: Request, res: Response, next: NextFunction) {
  try {
    const limit = Math.min(parseInt((req.query.limit as string) || "10"), 100);
    const posts = await Post.find().sort({ createdAt: -1 }).limit(limit).lean();

    const enriched = await Promise.all(
      posts.map(async (p) => {
        try {
          const user = await User.findById(p.creator).lean();
          return { ...p, creator: user };
        } catch {
          return p;
        }
      })
    );

    const last = posts[posts.length - 1];
    res.json({ documents: enriched, nextCursor: last ? String(last._id) : null });
  } catch (err) {
    next(err);
  }
}

// ✅ Recent Posts
export async function getRecentPosts(req: Request, res: Response, next: NextFunction) {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).limit(20).lean();
    res.json(posts);
  } catch (err) {
    next(err);
  }
}

// ✅ User Posts
export async function getUserPosts(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.params;
    const posts = await Post.find({ creator: userId }).sort({ createdAt: -1 }).lean();
    res.json(posts);
  } catch (err) {
    next(err);
  }
}

// ✅ Update Post
export async function updatePost(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { caption } = req.body;

    const filesArr = getFilesFromRequest(req);
    const existing = await Post.findById(id).lean();
    if (!existing) return res.status(404).json({ error: "Post not found" });

    let imageUrl = existing.imageUrl || [];
    let imageId = existing.imageId || [];

    if (filesArr.length) {
      imageUrl = filesArr.map((f) => `/uploads/${f.originalname}`);
      imageId = filesArr.map((f) => f.originalname);
    }

    const updated = await Post.findByIdAndUpdate(
      id,
      { caption: caption ?? existing.caption, imageUrl, imageId },
      { new: true }
    ).lean();

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

// ✅ Delete Post
export async function deletePost(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    await Post.findByIdAndDelete(id);
    res.json({ status: "Ok" });
  } catch (err) {
    next(err);
  }
}

// ✅ Like Post
export async function likePost(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { likes = [] } = req.body;

    const updated = await Post.findByIdAndUpdate(id, { likes }, { new: true }).lean();
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

// ✅ Save Post
export async function savePost(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const post = await Post.findById(id).lean();
    if (!post) return res.status(404).json({ error: "Post not found" });

    // Saves are tracked inside Post.saves array
    const updated = await Post.findByIdAndUpdate(
      id,
      { $addToSet: { saves: userId } },
      { new: true }
    ).lean();

    res.status(201).json(updated);
  } catch (err) {
    next(err);
  }
}

// ✅ Delete Saved Post
export async function deleteSavedPost(req: Request, res: Response, next: NextFunction) {
  try {
    const { saveId } = req.params;
    const { userId } = req.body;

    if (!userId) return res.status(400).json({ error: "userId is required" });

    const updated = await Post.findByIdAndUpdate(
      saveId,
      { $pull: { saves: userId } },
      { new: true }
    ).lean();

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

// ✅ Following Feed
export async function getFollowingPosts(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: "Missing userId param" });

    const following = await Follow.find({ userId }).lean();
    const followingIds = following.map((f) => f.followsUserId);

    if (!followingIds.length) return res.json({ documents: [] });

    const posts = await Post.find({ creator: { $in: followingIds } })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const enriched = await Promise.all(
      posts.map(async (p) => {
        try {
          const creator = await User.findById(p.creator).lean();
          return { ...p, creator };
        } catch {
          return p;
        }
      })
    );

    res.json({ documents: enriched });
  } catch (err) {
    next(err);
  }
}

// ✅ Followers Feed
export async function getFollowersPosts(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: "Missing userId param" });

    const followers = await Follow.find({ followsUserId: userId }).lean();
    const followerIds = followers.map((f) => f.userId);

    if (!followerIds.length) return res.json({ documents: [] });

    const posts = await Post.find({ creator: { $in: followerIds } })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const enriched = await Promise.all(
      posts.map(async (p) => {
        try {
          const creator = await User.findById(p.creator).lean();
          return { ...p, creator };
        } catch {
          return p;
        }
      })
    );

    res.json({ documents: enriched });
  } catch (err) {
    next(err);
  }
}
