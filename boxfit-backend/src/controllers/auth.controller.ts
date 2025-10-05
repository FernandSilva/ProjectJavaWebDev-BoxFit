import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretjwt";
const COOKIE_NAME = "jwt_token";

// --- Helper to create JWT ---
function createToken(user: any) {
  return jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
}

// --- Signup ---
export async function signup(req: Request, res: Response) {
  try {
    const { name, email, password, username, imageUrl } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: "Name, email, and password are required." });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "User already exists." });

    const user = await User.create({ name, email, password, username, imageUrl });
    const token = createToken(user);

    res
      .cookie(COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(201)
      .json({ message: "Signup successful", user: { ...user.toObject(), password: undefined } });
  } catch (err: any) {
    console.error("❌ signup error:", err.message);
    res.status(500).json({ error: "Failed to signup user." });
  }
}

// --- Login ---
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required." });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found." });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials." });

    const token = createToken(user);

    res
      .cookie(COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({ message: "Login successful", user: { ...user.toObject(), password: undefined } });
  } catch (err: any) {
    console.error("❌ login error:", err.message);
    res.status(500).json({ error: "Login failed." });
  }
}

// --- Get Current User ---
export async function getMe(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json(user);
  } catch (err: any) {
    console.error("❌ getMe error:", err.message);
    res.status(500).json({ error: "Failed to get current user." });
  }
}

// --- Logout ---
export async function logout(_req: Request, res: Response) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  res.status(200).json({ message: "Logout successful" });
}
