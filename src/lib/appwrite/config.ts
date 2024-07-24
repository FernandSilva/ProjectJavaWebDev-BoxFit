// Import the necessary modules from the Appwrite SDK
import { Client, Account, Databases, Storage, Avatars } from "appwrite";



// Environment Variables from Vite
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
  messageCollectionId: string;  // Added this line
  functionKey: string;
}

// Define your Appwrite configuration using environment variables
export const appwriteConfig: Config = {
  url: import.meta.env.VITE_APPWRITE_URL, // Your Appwrite endpoint
  projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID, // Your project ID on Appwrite
  databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID, // The database ID you're using
  storageId: import.meta.env.VITE_APPWRITE_STORAGE_ID, // The storage ID for file uploads
  userCollectionId: import.meta.env.VITE_APPWRITE_USER_COLLECTION_ID, // The collection ID for users
  postCollectionId: import.meta.env.VITE_APPWRITE_POST_COLLECTION_ID, // The collection ID for posts
  savesCollectionId: import.meta.env.VITE_APPWRITE_SAVES_COLLECTION_ID, // The collection ID for saved items
  userRelationshipsCollectionId: import.meta.env.VITE_APPWRITE_USER_RELATIONSHIPS_COLLECTION_ID, // The collection ID for user relationships
  commentsCollectionId: import.meta.env.VITE_APPWRITE_USER_COMMENTS_COLLECTION_ID, // The collection ID for comments
  messageCollectionId: import.meta.env.VITE_APPWRITE_MESSAGES_COLLECTION_ID, // The collection ID for messages
  functionKey: import.meta.env.VITE_APPWRITE_FUNCTION_KEY // Appwrite function key for server-side operations
};

// Initialize the Appwrite client
export const client = new Client()
  .setEndpoint(appwriteConfig.url) // Set the Appwrite API endpoint
  .setProject(appwriteConfig.projectId); // Set the project ID

// Initialize the Appwrite services with the configured client
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const avatars = new Avatars(client);

