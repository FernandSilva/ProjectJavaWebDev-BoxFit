// src/config/appwriteConfig.ts
export const appwriteConfig = {
  databaseId: process.env.APPWRITE_DATABASE_ID || "",
  projectId: process.env.APPWRITE_PROJECT_ID || "",
  endpoint: process.env.APPWRITE_ENDPOINT || "",
  apiKey: process.env.APPWRITE_API_KEY || "",

  // Collection IDs
  userCollectionId: process.env.APPWRITE_USER_COLLECTION_ID || "",
  postCollectionId: process.env.APPWRITE_POST_COLLECTION_ID || "",
  commentsCollectionId: process.env.APPWRITE_COMMENTS_COLLECTION_ID || "",
  notificationsCollectionId: process.env.APPWRITE_NOTIFICATIONS_COLLECTION_ID || "",
  messageCollectionId: process.env.APPWRITE_MESSAGE_COLLECTION_ID || "",
  savesCollectionId: process.env.APPWRITE_SAVES_COLLECTION_ID || "",
  likesCollectionId: process.env.APPWRITE_LIKES_COLLECTION_ID || "",
  followsCollectionId: process.env.APPWRITE_FOLLOWS_COLLECTION_ID || "",

  // Storage
  storageId: process.env.APPWRITE_STORAGE_ID || "",
};
