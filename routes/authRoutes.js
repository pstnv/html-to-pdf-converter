import express from "express";
const router = express.Router();

import {
    login,
    register,
    logout,
    verifyEmail,
    forgotPassword,
    resetPassword
} from "../controllers/authController.js";

import { authenticateUser } from "../middleware/authentication.js";

router.post("/register", register);
router.post("/verify-email", verifyEmail);
router.post("/login", login);
router.delete("/logout", authenticateUser, logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export { router };
