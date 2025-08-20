// routes/auth.routes.ts
import express from "express";
import { getCurrentUser, signInAccount, signOutAccount } from "../controllers/auth.controller";

const router = express.Router();

// POST /api/auth/signin
router.post("/signin", signInAccount);

// POST /api/auth/signout
router.post("/signout", signOutAccount);

// GET /api/auth/current-user
router.get("/current-user", getCurrentUser);

export default router;
