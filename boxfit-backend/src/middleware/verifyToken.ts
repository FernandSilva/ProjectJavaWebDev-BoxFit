// src/middleware/verifyToken.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const jwtSecret = process.env.JWT_SECRET || "super-secret-key";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    name?: string;
    username?: string;
  };
}

export const verifyToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: "Missing authentication token" });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as AuthenticatedRequest["user"];
    req.user = decoded;
    next();
  } catch (err) {
    console.error("🔐 Invalid token:", err);
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};
