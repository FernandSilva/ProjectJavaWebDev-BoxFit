import { Request, Response, NextFunction } from "express";
import Post from "../models/Post";
import User from "../models/User";
import Follow from "../models/Follow";

// ───────────────────────────────
// Helpers
// ───────────────────────────────
function getFilesFromRequest(req: Request): Express.Multer.File[] {
  // Handles req.files when it is:
  //  - an array (upload.array)
  //  - an object of arrays (upload.fields)
  //  - undefined
  const out: Express.Multer.File[] = [];
  const raw = (req as any).files;
  if (!raw) return out;

  const add = (entry: any) => {
    if (Array.isArray(entry)) {
      for (const f of entry) if (f && typeof f === "object") out.push(f);
    }
  };

  if (Array.isArray(raw)) add(raw);
  else if (typeof raw === "object") Object.values(raw).forEach(add);

  return out;
}

function toAbsoluteUrl(req: Request, url: string) {
  if (!url) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/uploads/")) {
    return `${req.protocol}://${req.get("host")}${url}`;
  }
  return `${req.protocol}://${req.get("host")}/uploads/${url}`;
}

function hydratePostForClient(req: Request, postDoc: any) {
  if (!postDoc) return postDoc;
  const obj =
    typeof postDoc.toObject === "function" ? postDoc.toObject() : { ...postDoc };

  obj.id = obj._id?.toString?.() ?? obj._id;

  if (Array.isArray(obj.imageUrl)) {
    obj.imageUrl = obj.imageUrl.map((u: string) => toAbsoluteUrl(req, u));
  } else if (typeof obj.imageUrl === "string") {
    obj.imageUrl = toAbsoluteUrl(req, obj.imageUrl);
  }

  if (obj.creator && typeof obj.creator === "object") {
    if (obj.creator.imageUrl) {
      obj.creator.imageUrl = toAbsoluteUrl(req, obj.creator.imageUrl);
    }
    obj.creator.id = obj.creator._id?.toString?.() ?? obj.creator._id;
  }

  return obj;
}

// ───────────────────────────────
// ✅ Create Post (multipart safe)
// ───────────────────────────────
export async function createPost(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId, caption = "", location = "", tags = "" } = req.body;
    if (!userId) return res.status(400).json({ error: "userId is required" });

    // ✅ SAFE: robustly read Multer files whether req.files is array or object
    const filesArr =
      Array.isArray((req as any).files) ? ((req as any).files as Express.Multer.File[]) : getFilesFromRequest(req);

    const imageUrls = filesArr.map((f) =>
      toAbsoluteUrl(req, `/uploads/${f.filename}`)
    );

    const post = await Post.create({
      userId,
      caption,
      imageUrl: imageUrls,
      location,
      tags,
      creator: userId, // Mongoose will cast to ObjectId
      likes: [],
      saves: [],
      comments: [],
    });

    const populated = await Post.findById(post._id)
      .populate("creator", "name username imageUrl _id")
      .lean();

    res.status(201).json(hydratePostForClient(req, populated));
  } catch (err: any) {
    console.error("❌ createPost error:", err.message);
    next(err);
  }
}

// ───────────────────────────────
export async function getPostById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!id || id === "undefined") {
      return res.status(400).json({ error: "Invalid or missing post ID" });
    }

    const post = await Post.findById(id)
      .populate("creator", "name username imageUrl _id")
      .lean();

    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json(hydratePostForClient(req, post));
  } catch (err: any) {
    console.error("❌ getPostById error:", err.message);
    res.status(500).json({ error: "Failed to fetch post" });
  }
}

// ───────────────────────────────
// ✅ List Posts (homepage feed) — POPULATED
// returns { documents: [...] } for FE compatibility
// ───────────────────────────────
export async function listPosts(req: Request, res: Response) {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const search = String(req.query.search || "").trim();
    const filter = search ? { caption: { $regex: search, $options: "i" } } : {};

    const posts = await Post.find(filter)
      .populate("creator", "name username imageUrl _id")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json({ documents: posts.map((p) => hydratePostForClient(req, p)) });
  } catch (err: any) {
    console.error("❌ listPosts error:", err.message);
    res.status(500).json({ error: "Failed to list posts" });
  }
}

// ───────────────────────────────
// ✅ Get Recent Posts — POPULATED
// returns array (your FE helper expects an array here)
// ───────────────────────────────
export async function getRecentPosts(req: Request, res: Response) {
  try {
    const posts = await Post.find()
      .populate("creator", "name username imageUrl _id")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    res.json(posts.map((p) => hydratePostForClient(req, p)));
  } catch (err: any) {
    console.error("❌ getRecentPosts error:", err.message);
    res.status(500).json({ error: "Failed to fetch recent posts" });
  }
}

// ───────────────────────────────
// ✅ Get User Posts (populated)
// ───────────────────────────────
export async function getUserPosts(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const posts = await Post.find({ creator: userId })
      .populate("creator", "name username imageUrl _id")
      .sort({ createdAt: -1 })
      .lean();

    res.json(posts.map((p) => hydratePostForClient(req, p)));
  } catch (err: any) {
    console.error("❌ getUserPosts error:", err.message);
    res.status(500).json({ error: "Failed to fetch user posts" });
  }
}

// ───────────────────────────────
// ✅ Update Post
// ───────────────────────────────
export async function updatePost(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { caption, location, tags } = req.body;

    if (!id || id === "undefined") {
      return res.status(400).json({ error: "Invalid or missing post ID" });
    }

    const filesArr = getFilesFromRequest(req);
    const updateData: any = { caption, location, tags };

    if (filesArr.length) {
      updateData.imageUrl = filesArr.map((f) =>
        toAbsoluteUrl(req, `/uploads/${f.filename}`)
      );
    }

    const updated = await Post.findByIdAndUpdate(id, updateData, { new: true })
      .populate("creator", "name username imageUrl _id")
      .lean();

    if (!updated) return res.status(404).json({ error: "Post not found" });
    res.json(hydratePostForClient(req, updated));
  } catch (err: any) {
    console.error("❌ updatePost error:", err.message);
    res.status(500).json({ error: "Failed to update post" });
  }
}

// ───────────────────────────────
// ✅ Delete Post
// ───────────────────────────────
export async function deletePost(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id || id === "undefined") {
      return res.status(400).json({ error: "Invalid or missing post ID" });
    }

    await Post.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err: any) {
    console.error("❌ deletePost error:", err.message);
    res.status(500).json({ error: "Failed to delete post" });
  }
}

// ───────────────────────────────
// ✅ Like Post (client sends full likes array)
// ───────────────────────────────
export async function likePost(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { likes = [] } = req.body;

    if (!id || id === "undefined") {
      return res.status(400).json({ error: "Invalid or missing post ID" });
    }

    const updated = await Post.findByIdAndUpdate(
      id,
      { likes },
      { new: true }
    )
      .populate("creator", "name username imageUrl _id")
      .lean();

    if (!updated) return res.status(404).json({ error: "Post not found" });
    res.json(hydratePostForClient(req, updated));
  } catch (err: any) {
    console.error("❌ likePost error:", err.message);
    res.status(500).json({ error: "Failed to like post" });
  }
}

// ───────────────────────────────
// ✅ Save / Unsave Post
// ───────────────────────────────
export async function savePost(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!id || id === "undefined") {
      return res.status(400).json({ error: "Invalid or missing post ID" });
    }

    const updated = await Post.findByIdAndUpdate(
      id,
      { $addToSet: { saves: userId } },
      { new: true }
    )
      .populate("creator", "name username imageUrl _id")
      .lean();

    if (!updated) return res.status(404).json({ error: "Post not found" });
    res.json(hydratePostForClient(req, updated));
  } catch (err: any) {
    console.error("❌ savePost error:", err.message);
    res.status(500).json({ error: "Failed to save post" });
  }
}

export async function deleteSavedPost(req: Request, res: Response) {
  try {
    const { saveId } = req.params;
    const { userId } = req.body;

    if (!saveId || saveId === "undefined") {
      return res.status(400).json({ error: "Invalid or missing post ID" });
    }

    const updated = await Post.findByIdAndUpdate(
      saveId,
      { $pull: { saves: userId } },
      { new: true }
    )
      .populate("creator", "name username imageUrl _id")
      .lean();

    if (!updated) return res.status(404).json({ error: "Post not found" });
    res.json(hydratePostForClient(req, updated));
  } catch (err: any) {
    console.error("❌ deleteSavedPost error:", err.message);
    res.status(500).json({ error: "Failed to remove saved post" });
  }
}

// ───────────────────────────────
// ✅ Following + Followers Feeds (populated)
// ───────────────────────────────
async function enrichFeed(req: Request, filter: any) {
  const posts = await Post.find(filter)
    .populate("creator", "name username imageUrl _id")
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  return posts.map((p) => hydratePostForClient(req, p));
}

export async function getFollowingPosts(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const following = await Follow.find({ userId }).lean();
    const ids = following.map((f) => f.followsUserId);
    res.json({ documents: await enrichFeed(req, { creator: { $in: ids } }) });
  } catch (err: any) {
    console.error("❌ getFollowingPosts error:", err.message);
    res.status(500).json({ error: "Failed to fetch following posts" });
  }
}

export async function getFollowersPosts(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const followers = await Follow.find({ followsUserId: userId }).lean();
    const ids = followers.map((f) => f.userId);
    res.json({ documents: await enrichFeed(req, { creator: { $in: ids } }) });
  } catch (err: any) {
    console.error("❌ getFollowersPosts error:", err.message);
    res.status(500).json({ error: "Failed to fetch followers posts" });
  }
}
