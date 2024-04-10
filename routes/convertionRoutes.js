import uploadController from "../controllers/uploadController.js";
import unpackController from "../controllers/unpackController.js";

import express from "express";
const router = express.Router();

router.route("/uploads").post(uploadController, unpackController);

export { router };
