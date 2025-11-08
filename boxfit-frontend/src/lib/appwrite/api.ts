// ============================================================================
// api.ts — Unified BoxFit API handler (frontend ↔ backend)
// ============================================================================

import type { Models } from "appwrite";
import { ID, Query } from "appwrite";
import { account, avatars, databases, appwriteConfig } from "./config";
import { INewPost, IUpdatePost, IUpdateUser } from "@/types";

// ============================================================================
// CONFIG + HELPERS
// ============================================================================

const BACKEND_BASE =
  import.meta.env?.VITE_API_URL?.replace(/\/$/, "") ||
  "https://projectjavawebdev-boxfit.onrender.com";

const API_BASE = `${BACKEND_BASE}/api`;

export function normalizeImageUrl(url?: string) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  if (url.startsWith("/uploads")) return `${BACKEND_BASE}${url}`;
  return `${BACKEND_BASE}/uploads/${url}`;
}

function normalizePost(p: any) {
  if (!p || typeof p !== "object") return p;
  const id = p._id || p.$id || p.id;
  const normImage = Array.isArray(p.imageUrl)
    ? p.imageUrl.map((u: string) => normalizeImageUrl(u))
    : normalizeImageUrl(p.imageUrl);
  const creator =
    p?.creator && typeof p.creator === "object"
      ? {
          ...p.creator,
          _id: p.creator._id || p.creator.$id || p.creator.id,
          imageUrl: normalizeImageUrl(p.creator.imageUrl),
        }
      : p.creator;
  return { ...p, _id: id, id, imageUrl: normImage, creator };
}

// ============================================================================
// UNIVERSAL FETCH WRAPPER
// ============================================================================
export async function apiJson<T = any>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const method = init.method || "GET";
  console.log(`[API] ${method} ${url}`);

  try {
    const isFormData =
      init?.body &&
      typeof FormData !== "undefined" &&
      (init.body as any) instanceof FormData;

    const res = await fetch(url, {
      credentials: "include",
      ...init,
      headers: isFormData
        ? { ...(init.headers || {}) }
        : {
            "Content-Type": "application/json",
            ...(init.headers || {}),
          },
    });

    const text = await res.text().catch(() => "");
    console.log(`[API] Response → ${res.status} ${res.statusText}`);

    if (!res.ok) {
      console.error(`❌ API Error: ${res.status} ${res.statusText}`);
      console.error("Response:", text);
      throw new Error(`HTTP ${res.status} ${res.statusText} — ${text}`);
    }

    return text ? (JSON.parse(text) as T) : ({} as T);
  } catch (err: any) {
    console.error("🚨 apiJson() failed:", path, err.message);
    throw err;
  }
}

// ============================================================================
// AUTH (MongoDB + JWT)
// ============================================================================

export async function signUpAccount(user: {
  name: string;
  email: string;
  password: string;
  username?: string;
  imageUrl?: string;
}) {
  const res = await fetch(`${API_BASE}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(user),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function signInAccount(user: { email: string; password: string }) {
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(user),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const getCurrentUser = async () => {
  const res = await fetch(`${API_BASE}/me`, { credentials: "include" });
  if (res.status === 401) return null;
  const user = await res.json();
  user.imageUrl = normalizeImageUrl(user.imageUrl);
  return user;
};

export async function signOutAccount() {
  const res = await fetch(`${API_BASE}/logout`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Logout failed");
  return res.json();
}

// ============================================================================
// POSTS
// ============================================================================
export async function createPost(post: INewPost) {
  const form = new FormData();
  (Array.isArray(post.file) ? post.file : [post.file]).forEach(
    (f) => f && form.append("files", f)
  );
  form.append("userId", post.userId);
  form.append("caption", post.caption ?? "");
  if (post.location) form.append("location", post.location);
  if (post.tags) form.append("tags", post.tags);

  console.log("📤 [API] createPost() sending FormData...");

  const res = await fetch(`${API_BASE}/posts`, {
    method: "POST",
    body: form,
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("❌ createPost failed:", res.status, text);
    throw new Error(`createPost failed: ${res.status} — ${text}`);
  }

  return res.json();
}

export const getPostById = (id: string) => apiJson(`/posts/${id}`);
export const listPosts = (limit = 10, search = "") =>
  apiJson(`/posts?limit=${limit}&search=${encodeURIComponent(search)}`);

export const updatePost = (post: IUpdatePost) => {
  const fd = new FormData();
  if (post.caption) fd.append("caption", post.caption);
  if (post.location) fd.append("location", post.location);
  if (post.tags) fd.append("tags", post.tags);
  (post.file || []).forEach((f) => fd.append("files", f));
  return apiJson(`/posts/${post.postId}`, { method: "PATCH", body: fd });
};

export const deletePost = (id: string) =>
  apiJson(`/posts/${id}`, { method: "DELETE" });

// ============================================================================
// LIKES & SAVES
// ============================================================================
export async function likePost(
  postId: string,
  likes: string[],
  userId: string
) {
  const res = await fetch(`${API_BASE}/posts/${postId}/like`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, likes }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getLikedPostsByUser(userId: string) {
  if (!userId) throw new Error("Missing userId in getLikedPostsByUser");
  const res = await fetch(`${API_BASE}/users/${userId}/likes`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  const arr = Array.isArray(data?.documents)
    ? data.documents
    : Array.isArray(data)
    ? data
    : [];
  const posts = arr
    .map((item: any) => item?.post ?? item)
    .filter(Boolean)
    .map((p: any) => ({
      ...p,
      imageUrl: Array.isArray(p.imageUrl)
        ? p.imageUrl.map(normalizeImageUrl)
        : normalizeImageUrl(p.imageUrl),
      creator:
        p.creator && typeof p.creator === "object"
          ? { ...p.creator, imageUrl: normalizeImageUrl(p.creator.imageUrl) }
          : p.creator,
    }));
  return { documents: posts };
}

export async function getSavedPostsByUser(userId: string) {
  if (!userId) throw new Error("Missing userId in getSavedPostsByUser");
  const res = await fetch(`${API_BASE}/saves/user/${userId}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  const arr = Array.isArray(data?.documents)
    ? data.documents
    : Array.isArray(data)
    ? data
    : [];
  const posts = arr
    .map((item: any) => item?.post ?? item)
    .filter(Boolean)
    .map((p: any) => ({
      ...p,
      imageUrl: Array.isArray(p.imageUrl)
        ? p.imageUrl.map(normalizeImageUrl)
        : normalizeImageUrl(p.imageUrl),
      creator:
        p.creator && typeof p.creator === "object"
          ? { ...p.creator, imageUrl: normalizeImageUrl(p.creator.imageUrl) }
          : p.creator,
    }));
  return { documents: posts };
}

export async function savePost(userId: string, postId: string) {
  const res = await fetch(`${API_BASE}/saves`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, postId }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteSavedPost(saveId: string) {
  const res = await fetch(`${API_BASE}/saves/${saveId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ============================================================================
// COMMENTS
// ============================================================================
export const getCommentsByPostId = (postId: string) =>
  apiJson(`/comments/post/${postId}`);
export const createComment = (data: any) =>
  apiJson(`/comments`, { method: "POST", body: JSON.stringify(data) });
export const likeComment = (id: string, userId: string) =>
  apiJson(`/comments/${id}/like`, {
    method: "POST",
    body: JSON.stringify({ userId }),
  });
export const unlikeComment = (id: string, userId: string) =>
  apiJson(`/comments/${id}/unlike`, {
    method: "POST",
    body: JSON.stringify({ userId }),
  });
export const deleteComment = (id: string) =>
  apiJson(`/comments/${id}`, { method: "DELETE" });

// ============================================================================
// USERS + RELATIONSHIPS
// ============================================================================
export const getUsers = (limit?: number) =>
  apiJson(`/users${limit ? `?limit=${limit}` : ""}`);
export const getUserById = async (id: string) => {
  const user = await apiJson(`/users/${id}`);
  user.imageUrl = normalizeImageUrl(user.imageUrl);
  return user;
};
export const updateUser = (user: IUpdateUser) => {
  const fd = new FormData();
  if (user.name) fd.append("name", user.name);
  if (user.bio) fd.append("bio", user.bio);
  if (user.file?.length) fd.append("file", user.file[0]);
  return apiJson(`/users/${user.userId}`, { method: "PATCH", body: fd });
};
export const followUser = (userId: string, followsUserId: string) =>
  apiJson(`/relationships`, {
    method: "POST",
    body: JSON.stringify({ userId, followsUserId }),
  });
export const unfollowUser = (docId: string) =>
  apiJson(`/relationships/${docId}`, { method: "DELETE" });
export const checkFollowStatus = (userId: string, followsUserId: string) =>
  apiJson(
    `/relationships/check?userId=${userId}&followsUserId=${followsUserId}`
  );

// ============================================================================
// MESSAGES
// ============================================================================
export const fetchUsersAndMessages = (userId: string, q = "") =>
  apiJson(`/messages/contacts?userId=${userId}&q=${q}`);
export const getMessages = (userId: string, peerId: string) =>
  apiJson(`/messages/thread?userId=${userId}&peerId=${peerId}`);
export const createMessage = (data: any) =>
  apiJson(`/messages`, { method: "POST", body: JSON.stringify(data) });
export const deleteMessage = (id: string) =>
  apiJson(`/messages/${id}`, { method: "DELETE" });
export const markMessagesAsRead = (senderId: string, recipientId: string) =>
  apiJson(`/messages/read`, {
    method: "PATCH",
    body: JSON.stringify({ senderId, recipientId }),
  });

// ============================================================================
// NOTIFICATIONS
// ============================================================================
export const getNotifications = async (userId: string) =>
  apiJson(`/notifications?userId=${userId}`);
export const markNotificationAsRead = (id: string) =>
  apiJson(`/notifications/${id}/read`, { method: "PATCH" });
export const deleteNotification = (id: string) =>
  apiJson(`/notifications/${id}`, { method: "DELETE" });
export const clearNotifications = (userId: string) =>
  apiJson(`/notifications/user/${userId}/clear`, { method: "DELETE" });

// ============================================================================
// FILES & CONTACT / SEARCH
// ============================================================================
export const uploadFile = (file: File) => {
  const fd = new FormData();
  fd.append("file", file);
  return apiJson(`/files`, { method: "POST", body: fd });
};
export const getFilePreview = (id: string) => apiJson(`/files/${id}/url`);
export const deleteFile = (id: string) =>
  apiJson(`/files/${id}`, { method: "DELETE" });
export const submitContactRequest = (data: {
  name: string;
  email: string;
  message: string;
}) =>
  apiJson(`/contact-requests`, {
    method: "POST",
    body: JSON.stringify(data),
  });

// ============================================================================
// POSTS HELPERS
// ============================================================================
export const getRecentPosts = async () => {
  const data = await apiJson(`/posts/recent?limit=20`);
  const docs = data?.documents || data || [];
  return {
    documents: docs.map((p: any) => ({
      ...p,
      imageUrl: Array.isArray(p.imageUrl)
        ? p.imageUrl.map(normalizeImageUrl)
        : normalizeImageUrl(p.imageUrl),
    })),
  };
};

export const getUserPosts = async (userId: string) => {
  const data = await apiJson(`/posts/user/${userId}`);
  const docs = data?.documents || data || [];
  return {
    documents: docs.map((p: any) => ({
      ...p,
      imageUrl: Array.isArray(p.imageUrl)
        ? p.imageUrl.map(normalizeImageUrl)
        : normalizeImageUrl(p.imageUrl),
    })),
  };
};

export const getFollowingPosts = async (userId: string) => {
  const data = await apiJson(`/posts/following/${userId}`);
  const docs = data?.documents || data || [];
  return {
    documents: docs.map((p: any) => ({
      ...p,
      imageUrl: Array.isArray(p.imageUrl)
        ? p.imageUrl.map(normalizeImageUrl)
        : normalizeImageUrl(p.imageUrl),
    })),
  };
};

// ============================================================================
// NOTIFICATIONS CREATION
// ============================================================================
export const createNotification = async (data: any) => {
  const res = await fetch(`${API_BASE}/notifications`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok)
    throw new Error(`Failed to create notification: ${res.status}`);
  return res.json();
};

// ============================================================================
// FOLLOWERS POSTS
// ============================================================================
export const getFollowersPosts = async (userId: string) => {
  if (!userId) throw new Error("Missing userId in getFollowersPosts");
  const data = await apiJson(`/posts/followers/${userId}`);
  const docs = data?.documents || data || [];
  return {
    documents: docs.map((p: any) => ({
      ...p,
      imageUrl: Array.isArray(p.imageUrl)
        ? p.imageUrl.map(normalizeImageUrl)
        : normalizeImageUrl(p.imageUrl),
    })),
  };
};
