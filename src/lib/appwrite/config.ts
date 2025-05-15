import { Client, Account, Databases, Storage, Avatars, Functions, ID } from "appwrite";

interface Config {
  url: string;
  projectId: string;
  databaseId: string;
  storageId: string;
  userCollectionId: string;
  postCollectionId: string;
  savesCollectionId: string;
  userRelationshipsCollectionId: string;
  commentsCollectionId: string;
  messageCollectionId: string;
  notificationsCollectionId: string;
  functionKey: string;
  gptKey: string;
  gptchatbotKey: string;
  contactRequestsCollectionId: string;
}

export const appwriteConfig: Config = {
  url: import.meta.env.VITE_APPWRITE_URL,
  projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID,
  databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
  storageId: import.meta.env.VITE_APPWRITE_STORAGE_ID,

  userCollectionId: import.meta.env.VITE_APPWRITE_USER_COLLECTION_ID,
  postCollectionId: import.meta.env.VITE_APPWRITE_POST_COLLECTION_ID,
  savesCollectionId: import.meta.env.VITE_APPWRITE_SAVES_COLLECTION_ID,
  userRelationshipsCollectionId: import.meta.env.VITE_APPWRITE_USER_RELATIONSHIPS_COLLECTION_ID,
  commentsCollectionId: import.meta.env.VITE_APPWRITE_USER_COMMENTS_COLLECTION_ID,
  messageCollectionId: import.meta.env.VITE_APPWRITE_MESSAGES_COLLECTION_ID,
  notificationsCollectionId: import.meta.env.VITE_APPWRITE_NOTIFICATIONS_COLLECTION_ID,

  contactRequestsCollectionId: import.meta.env.VITE_APPWRITE_CONTACT_REQUESTS_COLLECTION_ID,

  functionKey: import.meta.env.VITE_APPWRITE_FUNCTION_KEY,
  gptKey: import.meta.env.VITE_APPWRITE_GPT_KEY,
  gptchatbotKey: import.meta.env.VITE_APPWRITE_GPTCHATBOT_KEY,
};

export const client = new Client()
  .setEndpoint(appwriteConfig.url)
  .setProject(appwriteConfig.projectId);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const avatars = new Avatars(client);
export const functions = new Functions(client);

// ✅ This is the missing piece — you MUST export ID like this:
export { ID };
