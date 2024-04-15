import express from "express";
const router = express.Router();

import {
    getAllConversions,
    getConversion,
    createConversion,
    deleteConversion,
} from "../controllers/coversions.js";

router.route("/").get(getAllConversions).post(createConversion);
router
    .route("/:id")
    .get(getConversion)
    .delete(deleteConversion);

export { router };
