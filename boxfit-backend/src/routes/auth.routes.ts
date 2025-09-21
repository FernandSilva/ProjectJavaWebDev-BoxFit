// src/routes/auth.routes.ts
import express from "express";
import jwt from "jsonwebtoken";
import fetch, { Headers } from "node-fetch"; // ✅ pull in Headers class
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { Client, Users, ID } from "node-appwrite";

console.log("📦 Appwrite ENV Loaded:");
console.log(" - Endpoint:", process.env.APPWRITE_ENDPOINT);
console.log(" - Project ID:", process.env.APPWRITE_PROJECT_ID);
console.log(" - API Key exists:", !!process.env.APPWRITE_API_KEY);
console.log(" - JWT Secret exists:", !!process.env.JWT_SECRET);


dotenv.config();

const router = express.Router();
const endpoint = process.env.APPWRITE_ENDPOINT!;
const projectId = process.env.APPWRITE_PROJECT_ID!;
const apiKey = process.env.APPWRITE_API_KEY!;
const jwtSecret = process.env.JWT_SECRET!;

/* ============================================================================
   POST /signin – Authenticate user and set JWT cookie
============================================================================ */


router.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  console.log("📨 Incoming login request:", { email });

  if (!email || !password) {
    return res.status(400).json({ error: "Missing credentials" });
  }

  try {
    // 1. Create session with Appwrite
    console.log("🔗 Calling Appwrite to create session...");

    const sessionRes = await fetch(`${endpoint}/account/sessions/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Appwrite-Project": projectId,
      },
      body: JSON.stringify({ email, password }),
    });

    console.log("🔁 Appwrite session response status:", sessionRes.status);
    const session = await sessionRes.json();
    console.log("📦 Raw Appwrite response:", session);

    if (!sessionRes.ok) {
      return res.status(sessionRes.status).json({ error: "Failed to create session" });
    }

    // 2. Fetch user using session cookies
    const cookieHeader = session["$cookies"]?.join("; ") || "";
    console.log("🍪 Built Cookie Header:", cookieHeader);

    const userRes = await fetch(`${endpoint}/account`, {
      method: "GET",
      headers: {
        "X-Appwrite-Project": projectId,
        "X-Fallback-Cookies": cookieHeader,
        "Cookie": cookieHeader,
      },
    });

    console.log("👤 Appwrite user fetch status:", userRes.status);
    const user = await userRes.json();
    console.log("👤 Raw Appwrite user response:", user);

    if (!userRes.ok) {
      return res.status(401).json({ error: "Failed to fetch user from session" });
    }

    // 3. Create your own JWT
    const token = jwt.sign(
      {
        userId: user?.$id,
        email: user?.email,
        name: user?.name,
        username: user?.username,
      },
      jwtSecret,
      { expiresIn: "7d" }
    );

    // 4. Set cookie with token
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // ⚠️ Change to true in production
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ user });
  } catch (err: any) {
    console.error("❌ Signin error:", err.message);
    return res.status(500).json({ error: "Signin failed" });
  }
});



/* ============================================================================
   POST /signup – Create user via Appwrite API key
============================================================================ */
router.post("/signup", async (req, res) => {
  const { email, password, name, username } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const client = new Client()
      .setEndpoint(endpoint)
      .setProject(projectId)
      .setKey(apiKey);

    const users = new Users(client);

    const user = await users.create(ID.unique(), email, password, name);

    res.status(201).json({ user });
  } catch (error: any) {
    console.error("❌ Signup error:", error.message);
    res.status(500).json({ error: "Signup failed" });
  }
});

/* ============================================================================
   GET /me – Return user from JWT cookie
============================================================================ */
router.get("/me", (req, res) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, jwtSecret);
    return res.status(200).json(decoded);
  } catch (err: any) {
    console.error("❌ Auth check error:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
});

/* ============================================================================
   POST /signout – Clear JWT cookie
============================================================================ */
router.post("/signout", (_req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return res.status(200).json({ message: "Signed out successfully" });
});

export default router;
