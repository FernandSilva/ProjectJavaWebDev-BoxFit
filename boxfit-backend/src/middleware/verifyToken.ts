// src/middleware/verifyToken.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretjwt";

/**
 * 🔐 Middleware: Verify JWT from cookie or Authorization header.
 * Attaches decoded user info to `req.user`.
 */
export function verifyToken(req: Request, res: Response, next: NextFunction): void {
  try {
    // Extract token from cookie or Bearer header
    const token =
      req.cookies?.jwt_token ||
      req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("⚠️ Missing JWT token in request");
      }
      res.status(401).json({ error: "Unauthorized - No token provided" });
      return;
    }

    // Verify JWT and attach decoded payload
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    (req as any).user = decoded;

    if (process.env.NODE_ENV !== "production") {
      console.log("✅ JWT verified for user:", decoded.email);
    }

    next();
  } catch (err: any) {
    console.error("❌ verifyToken error:", err.message);
    res.status(401).json({ error: "Unauthorized - Invalid or expired token" });
  }
}
