// Back-compat wrapper that exposes flat *CollectionId keys expected by
// older controllers/routes while keeping a single source of truth.

import { cfg as base, APPWRITE, databases, storage, ID, Query } from "./appwriteClient";

export { databases, storage, ID, Query };

// Helper: pick the first non-empty string
const firstNonEmpty = (...vals: Array<string | undefined | null>) =>
  vals.find((v): v is string => typeof v === "string" && v.trim().length > 0) || "";

// Resolve contactRequests collection id, even if APPWRITE typings don’t have it yet
const contactRequestsId = firstNonEmpty(
  (APPWRITE as any)?.collections?.contactRequests,
  (base as any)?.collections?.contactRequests,
  process.env.APPWRITE_CONTACT_REQUESTS_COLLECTION_ID
);

/** Unified config object used by controllers/routes */
export const appwriteConfig = {
  // Core
  endpoint: base.endpoint ?? "",
  projectId: base.projectId ?? "",
  apiKey: base.apiKey ?? "", // server-side only
  databaseId: APPWRITE.databaseId,

  // Storage
  bucketId: APPWRITE.bucketId,
  storageId: APPWRITE.bucketId, // alias used by some modules

  // Nested (preferred) — matches the collection slugs in Appwrite
  collections: {
    users: APPWRITE.collections.users,
    posts: APPWRITE.collections.posts,
    comments: APPWRITE.collections.comments,
    notifications: APPWRITE.collections.notifications,
    messages: APPWRITE.collections.messages,
    relationships: APPWRITE.collections.relationships,
    saves: APPWRITE.collections.saves,
    contactRequests: contactRequestsId, // ✅ added
  },

  // Flat aliases for older code (keep them to avoid “*.CollectionId does not exist”)
  usersCollectionId: APPWRITE.collections.users,
  userCollectionId: APPWRITE.collections.users, // some files use singular

  postsCollectionId: APPWRITE.collections.posts,
  postCollectionId: APPWRITE.collections.posts, // singular alias

  commentsCollectionId: APPWRITE.collections.comments,
  notificationsCollectionId: APPWRITE.collections.notifications,
  messagesCollectionId: APPWRITE.collections.messages,

  relationshipsCollectionId: APPWRITE.collections.relationships,
  userRelationshipsCollectionId: APPWRITE.collections.relationships,

  savesCollectionId: APPWRITE.collections.saves,

  // ✅ new flat alias for contact requests
  contactRequestsCollectionId: contactRequestsId,
} as const;
