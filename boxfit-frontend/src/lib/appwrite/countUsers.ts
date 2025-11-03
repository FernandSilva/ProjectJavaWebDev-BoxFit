// Import the necessary modules from the Appwrite SDK
import { Client, Databases } from "appwrite";
import { appwriteConfig } from "./config"; // Importing config from config file

class UserCounter {
    private client: Client;
    private databases: Databases;

    constructor() {
        this.client = new Client()
            .setEndpoint(appwriteConfig.url) // Set the Appwrite API endpoint
            .setProject(appwriteConfig.projectId) // Set the project ID
            //; // You need to set the API key here, ensure it has permissions

        this.databases = new Databases(this.client);
    }

    public async countUsers(): Promise<void> {
        try {
            const result = await this.databases.listDocuments(appwriteConfig.databaseId, appwriteConfig.userCollectionId);
            console.log(`Total users: ${result.total}`);
        } catch (error) {
            console.error('Failed to count users:', error);
        }
    }
}

// Create an instance of UserCounter and call countUsers
const userCounter = new UserCounter();
userCounter.countUsers();
