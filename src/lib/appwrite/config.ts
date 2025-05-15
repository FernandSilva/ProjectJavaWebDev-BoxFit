// Import Appwrite modules
import { Client, Account, Databases, Storage, Avatars, Functions, ID } from "appwrite";

// Define the structure for Appwrite configurations
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

// Set Appwrite configuration using environment variables
export const appwriteConfig: Config = {
  url: import.meta.env.VITE_APPWRITE_URL, // Appwrite endpoint
  projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID, // Appwrite project ID
  databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID, // Database ID
  storageId: import.meta.env.VITE_APPWRITE_STORAGE_ID, // Storage ID

  userCollectionId: import.meta.env.VITE_APPWRITE_USER_COLLECTION_ID, // Users collection ID
  postCollectionId: import.meta.env.VITE_APPWRITE_POST_COLLECTION_ID, // Posts collection ID
  savesCollectionId: import.meta.env.VITE_APPWRITE_SAVES_COLLECTION_ID, // Saves collection ID
  userRelationshipsCollectionId: import.meta.env.VITE_APPWRITE_USER_RELATIONSHIPS_COLLECTION_ID, // User relationships
  commentsCollectionId: import.meta.env.VITE_APPWRITE_USER_COMMENTS_COLLECTION_ID, // Comments collection
  messageCollectionId: import.meta.env.VITE_APPWRITE_MESSAGES_COLLECTION_ID, // Messages collection
  notificationsCollectionId: import.meta.env.VITE_APPWRITE_NOTIFICATIONS_COLLECTION_ID, // Notifications collection

  contactRequestsCollectionId: import.meta.env.VITE_APPWRITE_CONTACT_REQUESTS_COLLECTION_ID, // Contact Us messages

  functionKey: import.meta.env.VITE_APPWRITE_FUNCTION_KEY, // Appwrite function key
  gptKey: import.meta.env.VITE_APPWRITE_GPT_KEY, // GPT key
  gptchatbotKey: import.meta.env.VITE_APPWRITE_GPTCHATBOT_KEY, // Chatbot GPT key
};

// Initialize Appwrite client and services
export const client = new Client()
  .setEndpoint(appwriteConfig.url) // Set API endpoint
  .setProject(appwriteConfig.projectId); // Set project ID

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const avatars = new Avatars(client);
export const functions = new Functions(client);

// ✅ Export ID for document creation (used in api.ts)
export { ID };
