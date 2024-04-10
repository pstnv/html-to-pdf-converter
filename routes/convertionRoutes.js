import uploadController from "../controllers/uploadController.js";

import express from "express";
const router = express.Router();

router.route("/uploads").post(uploadController);

export { router };
