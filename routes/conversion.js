import express from "express";
const router = express.Router();

import {
    getAllConversions,
    getConversion,
    createConversion,
    updateConversion,
    deleteConversion,
} from "../controllers/coversions.js";

router.route("/").get(getAllConversions).post(createConversion);
router
    .route("/:id")
    .get(getConversion)
    .patch(updateConversion)
    .delete(deleteConversion);

export { router };
