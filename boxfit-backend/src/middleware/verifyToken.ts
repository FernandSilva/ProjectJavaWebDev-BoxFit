import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretjwt";

export function verifyToken(req: Request, res: Response, next: NextFunction) {
  try {
    const token =
      req.cookies?.jwt_token ||
      req.headers.authorization?.replace("Bearer ", "");

    if (!token) return res.status(401).json({ error: "No token provided" });

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    (req as any).user = decoded;
    next();
  } catch (err) {
    console.error("❌ verifyToken error:", (err as any).message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
