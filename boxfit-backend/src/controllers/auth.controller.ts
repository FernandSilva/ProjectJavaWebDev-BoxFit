"use strict";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_key";

// ─────────────────────────────────────────────
// SIGN UP
// ─────────────────────────────────────────────
export async function signUp(req: Request, res: Response) {
  try {
    const { name, username, email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const existingUser = await User.findOne({ email }).lean();
    if (existingUser)
      return res.status(400).json({ error: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      username,
      email,
      password: hashed,
    });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });
    res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(201)
      .json({
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
      });
  } catch (err: any) {
    console.error("❌ signUp error:", err.message);
    res.status(500).json({ error: "Failed to sign up" });
  }
}

// ─────────────────────────────────────────────
// LOGIN 
// ─────────────────────────────────────────────
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.warn("Login failed: User not found for email", email);
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.password || typeof user.password !== "string") {
      console.error("Login failed: Password is missing or invalid for", user.email);
      return res.status(500).json({ error: "Server misconfiguration: password missing" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      console.warn("Login failed: Invalid password for", user.email);
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    console.log("✅ Login successful for:", user.email);

    return res.json({
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      imageUrl: user.imageUrl,
    });
  } catch (err: any) {
    console.error("❌ login error:", err.message);
    res.status(500).json({ error: "Failed to log in" });
  }
}



// ─────────────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────────────
export async function logout(_req: Request, res: Response) {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });
    res.json({ message: "Logged out successfully" });
  } catch (err: any) {
    console.error("❌ logout error:", err.message);
    res.status(500).json({ error: "Failed to log out" });
  }
}

// ─────────────────────────────────────────────
// GET CURRENT USER
// ─────────────────────────────────────────────
export async function getCurrentUser(req: any, res: Response) {
  try {
    const user = await User.findById(req.user?.id)
      .select("-password")
      .lean();
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err: any) {
    console.error("❌ getCurrentUser error:", err.message);
    res.status(500).json({ error: "Failed to fetch user" });
  }
}
