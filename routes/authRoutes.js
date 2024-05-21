import express from "express";
const router = express.Router();

import {
    login,
    register,
    logout,
    verifyEmail,
} from "../controllers/authController.js";

router.post("/register", register);
router.post("/verify-email", verifyEmail);
router.post("/login", login);
router.delete("/logout", logout);

export { router };