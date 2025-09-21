// controllers/auth.controller.ts
import { Request, Response } from "express";
import fetch from "node-fetch"; // Ensure this is installed via `npm i node-fetch`
import { appwriteConfig } from "../lib/appwriteConfig";

export const signInAccount = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing credentials" });
    }

    const response = await fetch(`${appwriteConfig.endpoint}/account/sessions/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Appwrite-Project": appwriteConfig.projectId,
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errData = await response.json();
      console.error("❌ Signin error:", errData);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const session = await response.json();
    return res.status(200).json({ session });
  } catch (error: any) {
    console.error("❌ Signin exception:", error.message);
    return res.status(500).json({ error: "Signin failed" });
  }
};
