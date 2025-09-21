import "dotenv/config";
import * as SDK from "node-appwrite";

/* -----------------------------------------------------------------------------
   env helpers
----------------------------------------------------------------------------- */

// add at top if not present
// src/lib/appwriteClient.ts

import { Readable } from "stream";
import { Express } from "express";


export async function toInputFileFromMulter(f: Express.Multer.File) {
  console.log("[toInputFileFromMulter] ⬇️ Incoming multer file:", {
    originalname: f.originalname,
    size: f.size,
    mimetype: f.mimetype,
    bufferType: typeof f.buffer,
    bufferLength: f.buffer?.length,
  });

  if (!f || !f.buffer || !Buffer.isBuffer(f.buffer)) {
    console.error("[toInputFileFromMulter] ❌ Invalid multer buffer", {
      hasBuffer: !!f?.buffer,
      bufferType: typeof f?.buffer,
      isBuffer: Buffer.isBuffer(f?.buffer),
    });
    throw new Error("Invalid or missing file buffer.");
  }

  const inputFile = {
    stream: Readable.from(f.buffer),
    filename: f.originalname,
    type: f.mimetype || "application/octet-stream",
    size: f.size || f.buffer?.length || 0,
  };

  console.log("[toInputFileFromMulter] ✅ Built inputFile:", {
    keys: Object.keys(inputFile),
    filename: inputFile.filename,
    type: inputFile.type,
    size: inputFile.size,
    streamIsReadable: typeof inputFile.stream.read === "function"
  });

  return inputFile;
}













function env(name: string, ...aliases: string[]) {
  for (const k of [name, ...aliases]) {
    const v = process.env[k];
    if (v && v.trim()) return v.trim();
  }
  return undefined;
}
function envBool(name: string, fallback = false) {
  const v = process.env[name];
  if (v == null) return fallback;
  return ["1", "true", "yes", "on"].includes(v.toLowerCase());
}

// lightweight logger (avoids importing your logger here to prevent cycles)
const LOG_LEVEL = (process.env.LOG_LEVEL || "info").toLowerCase();
const log = {
  debug: (...a: any[]) => LOG_LEVEL === "debug" && console.debug("[appwrite]", ...a),
  info:  (...a: any[]) => ["debug", "info"].includes(LOG_LEVEL) && console.info("[appwrite]", ...a),
  warn:  (...a: any[]) => console.warn("[appwrite]", ...a),
  error: (...a: any[]) => console.error("[appwrite]", ...a),
};

/* -----------------------------------------------------------------------------
   Raw config from env (supports several alias names)
----------------------------------------------------------------------------- */
const FAIL_ON_APPWRITE_INIT = envBool("FAIL_ON_APPWRITE_INIT", true);

export const cfg = {
  endpoint:   env("APPWRITE_ENDPOINT"),
  projectId:  env("APPWRITE_PROJECT_ID"),
  apiKey:     env("APPWRITE_API_KEY"),

  databaseId: env("APPWRITE_DATABASE_ID"),

  // collections (accept singular/plural/env variants)
  usersCollectionId:             env("APPWRITE_USER_COLLECTION_ID", "APPWRITE_USERS_COLLECTION_ID"),
  postsCollectionId:             env("APPWRITE_POST_COLLECTION_ID", "APPWRITE_POSTS_COLLECTION_ID"),
  commentsCollectionId:          env("APPWRITE_COMMENTS_COLLECTION_ID"),
  notificationsCollectionId:     env("APPWRITE_NOTIFICATIONS_COLLECTION_ID"),
  messagesCollectionId:          env("APPWRITE_MESSAGES_COLLECTION_ID"),
  userRelationshipsCollectionId: env("APPWRITE_USER_RELATIONSHIPS_COLLECTION_ID", "APPWRITE_RELATIONSHIPS_COLLECTION_ID"),
  savesCollectionId:             env("APPWRITE_SAVES_COLLECTION_ID"),

  // storage bucket
  bucketId: env("APPWRITE_BUCKET_ID", "APPWRITE_STORAGE_ID"),
};

// validate required
const required: Array<[keyof typeof cfg, string[]]> = [
  ["endpoint", []],
  ["projectId", []],
  ["apiKey", []],
  ["databaseId", []],
  ["usersCollectionId", ["APPWRITE_USER_COLLECTION_ID", "APPWRITE_USERS_COLLECTION_ID"]],
  ["postsCollectionId", ["APPWRITE_POST_COLLECTION_ID", "APPWRITE_POSTS_COLLECTION_ID"]],
  ["commentsCollectionId", []],
  ["notificationsCollectionId", []],
  ["messagesCollectionId", []],
  ["userRelationshipsCollectionId", ["APPWRITE_USER_RELATIONSHIPS_COLLECTION_ID", "APPWRITE_RELATIONSHIPS_COLLECTION_ID"]],
  ["savesCollectionId", []],
  ["bucketId", ["APPWRITE_BUCKET_ID", "APPWRITE_STORAGE_ID"]],
];

const missing = required
  .filter(([k]) => !cfg[k])
  .map(([k, aliases]) => (aliases.length ? `${String(k)} (${aliases.join(" | ")})` : String(k)));

if (missing.length) {
  const msg = `Missing env var(s): ${missing.join(", ")}`;
  if (FAIL_ON_APPWRITE_INIT) throw new Error(msg);
  log.warn(msg, "(continuing because FAIL_ON_APPWRITE_INIT=false)");
}

/* -----------------------------------------------------------------------------
   SDK client + services
----------------------------------------------------------------------------- */
export const client = new SDK.Client()
  .setEndpoint(cfg.endpoint!)
  .setProject(cfg.projectId!)
  .setKey(cfg.apiKey!); // server key

export const databases = new SDK.Databases(client);
export const storage   = new SDK.Storage(client);

// Back-compat alias some code expects
export const db = databases;

// Re-export these so controllers can import from here
export { ID, Query } from "node-appwrite";

/* -----------------------------------------------------------------------------
   IDs in multiple shapes (to satisfy old & new imports)
----------------------------------------------------------------------------- */

// Compact ids bag (old code sometimes imports `ids` or `IDs`)
export const ids = {
  databaseId: cfg.databaseId!,
  usersCollectionId: cfg.usersCollectionId!,
  postsCollectionId: cfg.postsCollectionId!,
  commentsCollectionId: cfg.commentsCollectionId!,
  notificationsCollectionId: cfg.notificationsCollectionId!,
  messagesCollectionId: cfg.messagesCollectionId!,
  // userRelationshipsCollectionId: cfg.userRelationshipsCollectionId!,
  relationshipsCollectionId: cfg.userRelationshipsCollectionId!,
  savesCollectionId: cfg.savesCollectionId!,
  bucketId: cfg.bucketId!,
} as const;

export const IDs = {
  db: ids.databaseId,
  users: ids.usersCollectionId,
  posts: ids.postsCollectionId,
  comments: ids.commentsCollectionId,
  notifications: ids.notificationsCollectionId,
  messages: ids.messagesCollectionId,
  relationships: ids.relationshipsCollectionId,
  saves: ids.savesCollectionId,
  bucket: ids.bucketId,
} as const;

// Newer, more explicit shape used in updated controllers
export const APPWRITE = {
  databaseId: ids.databaseId,
  bucketId: ids.bucketId,
  collections: {
    users: IDs.users,
    posts: IDs.posts,
    comments: IDs.comments,
    notifications: IDs.notifications,
    messages: IDs.messages,
    relationships: IDs.relationships,
    saves: IDs.saves,
  },
} as const;

/* -----------------------------------------------------------------------------
   Helpers
----------------------------------------------------------------------------- */

/**
 * Safely build an Appwrite InputFile from a Multer file without importing
 * InputFile as a TS type (which may differ across SDK versions).
 */


/** Minimal connectivity/permissions probe for server startup. */
export async function checkAppwrite(): Promise<boolean> {
  try {
    // Try a cheap, non-destructive call
    await databases.listDocuments(APPWRITE.databaseId, APPWRITE.collections.users, [SDK.Query.limit(1)]);
    log.info("✅ Appwrite connected (collections accessible).");
    return true;
  } catch (err: any) {
    log.warn("❌ Appwrite connectivity/permission check failed:", err?.message || String(err));
    return false;
  }
}

/* -----------------------------------------------------------------------------
   Startup diagnostics (redacts API key)
----------------------------------------------------------------------------- */
(function startupLog() {
  const apiKey = cfg.apiKey || "";
  const redacted =
    apiKey && apiKey.length >= 8 ? `${"*".repeat(apiKey.length - 6)}${apiKey.slice(-6)}` : "(set)";

  log.info("Endpoint:", cfg.endpoint);
  log.info("Project:", cfg.projectId);
  log.debug("API key:", redacted);
  log.info("Database:", ids.databaseId);
  log.info("Bucket:", ids.bucketId);
  log.info("Collections:", {
    users: IDs.users,
    posts: IDs.posts,
    comments: IDs.comments,
    notifications: IDs.notifications,
    messages: IDs.messages,
    relationships: IDs.relationships,
    saves: IDs.saves,
  });
})();
