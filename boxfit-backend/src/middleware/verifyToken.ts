// src/middleware/verifyToken.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretjwt";

/**
 * 🔐 Middleware: Verify JWT from either:
 *   - HttpOnly cookie: req.cookies.token
 *   - Bearer Header: Authorization: Bearer <token>
 *
 * Attaches decoded user data to req.user
 */
export function verifyToken(req: Request, res: Response, next: NextFunction): void {
  try {
    let token: string | null = null;

    // 1️⃣ Check Authorization header
    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    // 2️⃣ Fallback to JWT cookie (this is what your AuthController uses)
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    // Debug log (safe to leave during deployment)
    console.log("🔍 Incoming Token:", token);

    // 3️⃣ If missing, block request
    if (!token) {
      console.warn("⚠️ Missing JWT token in request");
      res.status(401).json({ error: "Unauthorized - No token provided" });
      return;
    }

    // 4️⃣ Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email?: string;
    };

    // Attach user to request
    (req as any).user = decoded;

    console.log("✅ JWT verified → User:", decoded.id);

    next();
  } catch (err: any) {
    console.error("❌ verifyToken error:", err.message);
    res.status(401).json({
      error: "Unauthorized - Invalid or expired token",
    });
  }
}
