import express from "express";
const router = express.Router();

import {
    getAllConversions,
    createConversion,
    deleteConversion,
} from "../controllers/coversions.js";

router.route("/").get(getAllConversions).post(createConversion);
router
    .route("/:id")
    .delete(deleteConversion);

export { router };
