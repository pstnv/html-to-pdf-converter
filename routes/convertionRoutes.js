import uploadController from "../controllers/uploadController.js";
import unzipController from "../controllers/unzipController.js";

import express from "express";
const router = express.Router();

router.route("/uploads").post(uploadController, unzipController);

export { router };
