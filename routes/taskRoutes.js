import express from "express";
const router = express.Router();
import {
    authenticateUser,
    checkAuthentication,
} from "../middleware/authentication.js";

import {
    getAllTasks,
    deleteTask,
    createTask,
} from "../controllers/taskController.js";

// логгер для одного route - конвертации
import logger from "../middleware/morgan.js";

router.route("/").get(authenticateUser, getAllTasks);
router.route("/html_to_pdf").post(logger, checkAuthentication, createTask);
router.route("/:id").delete(authenticateUser, deleteTask);

export { router };
