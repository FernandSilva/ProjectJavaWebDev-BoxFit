// controllers/auth.controller.ts
import { Request, Response } from "express";
import { account } from "../lib/appwriteClient";

// GET /api/auth/current-user
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const sessionCookie = req.headers.cookie;

    if (!sessionCookie) {
      return res.status(401).json({ error: "No session found" });
    }

    const session = await account.getSession("current");

    const user = await account.get();

    res.status(200).json({ user, session });
  } catch (error: any) {
    console.error("Error fetching current user:", error.message);
    res.status(500).json({ error: "Failed to get current user" });
  }
};

// POST /api/auth/signin
export const signInAccount = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing credentials" });
    }

    const session = await account.createEmailSession(email, password);
    const user = await account.get();

    res.status(200).json({ user, session });
  } catch (error: any) {
    console.error("Sign-in failed:", error.message);
    res.status(401).json({ error: "Invalid credentials" });
  }
};

// POST /api/auth/signout
export const signOutAccount = async (_req: Request, res: Response) => {
  try {
    await account.deleteSession("current");
    res.status(200).json({ message: "Signed out successfully" });
  } catch (error: any) {
    console.error("Sign-out failed:", error.message);
    res.status(500).json({ error: "Failed to sign out" });
  }
};
