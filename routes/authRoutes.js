import express from "express";
const router = express.Router();

import { login, register, logout } from "../controllers/authController.js";

router.post("/register", register);
router.post("/login", login);
router.delete("/logout", logout);

export { router };
