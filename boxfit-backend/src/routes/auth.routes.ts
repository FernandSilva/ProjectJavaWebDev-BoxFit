// src/routes/auth.routes.ts
import { Router } from "express";
import { signup, login, getMe, logout } from "../controllers/auth.controller";
import { verifyToken } from "../middleware/verifyToken";

const router = Router();

/* ============================================================================
   AUTH ROUTES
============================================================================ */

router.post("/auth/signup", signup);
router.post("/auth/login", login);
router.get("/auth/me", verifyToken, getMe);
router.post("/auth/logout", logout);

export default router;
