import { Client, Account, Databases, Users, Storage } from "node-appwrite";
import dotenv from "dotenv";

dotenv.config();

const endpoint = process.env.APPWRITE_ENDPOINT?.trim();
const projectId = process.env.APPWRITE_PROJECT_ID?.trim();
const apiKey = process.env.APPWRITE_API_KEY?.trim();

if (!endpoint || !projectId || !apiKey) {
  throw new Error("Appwrite environment variables are missing.");
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const account = new Account(client);
const databases = new Databases(client);
const users = new Users(client);
const storage = new Storage(client); // ✅ ADD THIS LINE

export { client, account, databases, users, storage }; // ✅ AND EXPORT IT HERE
