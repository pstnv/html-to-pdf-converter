import convertController from "../controllers/convertController.js";

import express from "express";
const router = express.Router();

router.route("/").post(convertController);
export { router };
