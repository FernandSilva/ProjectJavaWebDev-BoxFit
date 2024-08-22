import axios from "axios";
import { appwriteConfig } from "@/lib/appwrite/config";

// Correctly format the function endpoint URL
const functionEndpoint = `${appwriteConfig.url}/v1/functions/${appwriteConfig.gptchatbotKey}/execution`;

export const callOpenAI = async (prompt: string) => {
  try {
    const response = await axios.post(functionEndpoint, { prompt }, {
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': appwriteConfig.projectId, // Ensure this header is set correctly
        'X-Appwrite-Key': appwriteConfig.functionKey // If you need to provide a key for function execution
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error calling Appwrite function:', error);
    throw error;
  }
};
