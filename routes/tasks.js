import express from "express";
const router = express.Router();

import { getAllTasks, deleteTask } from "../controllers/tasks.js";

router.route("/").get(getAllTasks);
router.route("/:id").delete(deleteTask);

export { router };
