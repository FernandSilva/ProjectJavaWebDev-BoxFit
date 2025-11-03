// src/controllers/auth.controller.ts
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretjwt";
const COOKIE_NAME = "jwt_token";

function createToken(user: any) {
  return jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
}

/* ────────────────────────────────────────────────────────────
 * POST /auth/signup
 * Create new user + set cookie
 * ──────────────────────────────────────────────────────────── */
export async function signup(req: Request, res: Response) {
  const t0 = Date.now();
  try {
    const { name, email, password, username, imageUrl } = req.body || {};
    console.log("➡️  [AUTH/SIGNUP] Payload:", {
      namePresent: !!name,
      email,
      username,
      imageUrlPresent: !!imageUrl,
      // never log raw passwords
    });

    if (!name || !email || !password) {
      console.warn("⚠️  [AUTH/SIGNUP] Missing required fields");
      return res.status(400).json({ error: "Name, email, and password are required." });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      console.warn("⚠️  [AUTH/SIGNUP] Email already exists:", normalizedEmail);
      return res.status(400).json({ error: "User already exists." });
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password, // hashed by pre-save
      username: username ? String(username).toLowerCase().trim() : undefined,
      imageUrl,
    });

    console.log("✅ [AUTH/SIGNUP] User created:", user.email);

    const token = createToken(user);
    console.log("🔑 [AUTH/SIGNUP] JWT issued for:", user.email);

    res
      .cookie(COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(201)
      .json({
        message: "Signup successful",
        user: user.toSafeJSON(),
      });

    console.log("🟢 [AUTH/SIGNUP] Completed in", Date.now() - t0, "ms");
  } catch (err: any) {
    console.error("❌ [AUTH/SIGNUP] Error:", err?.message, err?.stack);
    res.status(500).json({ error: "Failed to signup user." });
  }
}

/* ────────────────────────────────────────────────────────────
 * POST /auth/login
 * Authenticate + set cookie
 * ──────────────────────────────────────────────────────────── */
export async function login(req: Request, res: Response) {
  const t0 = Date.now();
  try {
    const { email, password } = req.body || {};
    console.log("➡️  [AUTH/LOGIN] Payload:", {
      email,
      passwordPresent: typeof password === "string" && password.length > 0,
    });

    if (!email || !password) {
      console.warn("⚠️  [AUTH/LOGIN] Missing email or password");
      return res.status(400).json({ error: "Email and password are required." });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    // Explicitly include password in case schema ever changes to select: false
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      console.warn("⚠️  [AUTH/LOGIN] User not found:", normalizedEmail);
      return res.status(404).json({ error: "User not found." });
    }

    console.log("🔍 [AUTH/LOGIN] Found user:", user.email);
    console.log(
      "🔐 [AUTH/LOGIN] Stored hash present:",
      typeof (user as any).password === "string" && (user as any).password.length > 0
    );

    const isMatch = await user.comparePassword(password);
    console.log("🧪 [AUTH/LOGIN] Password match:", isMatch);

    if (!isMatch) {
      console.warn("⚠️  [AUTH/LOGIN] Invalid credentials for:", user.email);
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const token = createToken(user);
    console.log("🔑 [AUTH/LOGIN] JWT issued for:", user.email);

    res
      .cookie(COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        message: "Login successful",
        user: user.toSafeJSON(),
      });

    console.log("🟢 [AUTH/LOGIN] Completed in", Date.now() - t0, "ms");
  } catch (err: any) {
    // Surface the true message in logs; keep response generic
    console.error("❌ [AUTH/LOGIN] Error:", err?.message, err?.stack);
    res.status(500).json({ error: "Login failed." });
  }
}

/* ────────────────────────────────────────────────────────────
 * GET /auth/me
 * Return current user (from cookie)
 * ──────────────────────────────────────────────────────────── */
export async function getMe(req: Request, res: Response) {
  try {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) {
      console.warn("⚠️  [AUTH/ME] No token cookie");
      return res.status(401).json({ error: "Not authenticated" });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email?: string };
    console.log("🧾 [AUTH/ME] JWT verified for:", decoded?.email || decoded?.id);

    const user = await User.findById(decoded.id);
    if (!user) {
      console.warn("⚠️  [AUTH/ME] User not found for id:", decoded.id);
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user.toSafeJSON());
  } catch (err: any) {
    console.error("❌ [AUTH/ME] Error:", err?.message);
    res.status(401).json({ error: "Failed to get current user" });
  }
}

/* ────────────────────────────────────────────────────────────
 * POST /auth/logout
 * Clear JWT cookie
 * ──────────────────────────────────────────────────────────── */
export async function logout(_req: Request, res: Response) {
  try {
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    console.log("🚪 [AUTH/LOGOUT] Cookie cleared");
    res.status(200).json({ message: "Logout successful" });
  } catch (err: any) {
    console.error("❌ [AUTH/LOGOUT] Error:", err?.message);
    res.status(500).json({ error: "Logout failed." });
  }
}
