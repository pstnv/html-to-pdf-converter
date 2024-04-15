import express from "express";
const router = express.Router();

import { login, register } from "../controllers/auth.js";

router.post("/register", register);
router.post("/login", login);

export { router };
