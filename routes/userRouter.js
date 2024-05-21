import express from "express";
const router = express.Router();

import { authenticateUser } from "../middleware/authentication.js";
import {
    showCurrentUser,
    updateUser,
    updateUserPassword,
    updateUserEmail,
    verifyUpdateUserEmail
} from "../controllers/userController.js";

router.route("/showMe").get(authenticateUser, showCurrentUser);
router.route("/updateUser").patch(authenticateUser, updateUser);
router.route("/updateUserPassword").patch(authenticateUser, updateUserPassword);
router.route("/updateUserEmail").patch(authenticateUser, updateUserEmail);
router.route("/verifyUpdateUserEmail").patch(authenticateUser, verifyUpdateUserEmail);

export { router };
