"use strict";
const express_1 = require("express");
const AuthController = require("../controllers/auth.controller");
const { verifyToken } = require("../middleware/verifyToken");

const router = (0, express_1.Router)();

/**
 * 🔐 AUTH ROUTES (Flat structure)
 * Mounted under /api in server.js
 * ----------------------------------------------------
 * POST   /api/signup      → Create new account
 * POST   /api/login       → Authenticate and issue JWT cookie
 * POST   /api/logout      → Clear session cookie
 * GET    /api/me          → Return current user from JWT
 */

router.post("/signup", AuthController.signUp);
router.post("/login", AuthController.login);
router.post("/logout", AuthController.logout);
router.get("/me", verifyToken, AuthController.getCurrentUser);

console.log("✅ Auth routes registered (flat structure)");

exports.default = router;
