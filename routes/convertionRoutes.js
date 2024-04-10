import uploadController from "../controllers/uploadController.js";
import unzipController from "../controllers/unzipController.js";
import htmlController from "../controllers/htmlController.js";
import convertController from "../controllers/convertController.js";

import express from "express";
const router = express.Router();

router
    .route("/uploads")
    .post(uploadController, unzipController, htmlController);

export { router };
