import express from "express";
const router = express.Router();

// swagger
import swaggerUI from "swagger-ui-express";
/* 
when use this:
import swaggerFile from "./../swagger-output.json" assert { type: "json" };
get:
(node: 6456) ExperimentalWarning: Importing JSON modules is an experimental feature and might change at any time
*/

// solution
import { createRequire } from "module"; // Bring in the ability to create the 'require' method
const require = createRequire(import.meta.url); // construct the require method
const swaggerFile = require("./../swagger-output.json"); // use the require method


router.use("/", swaggerUI.serve, swaggerUI.setup(swaggerFile));

export { router };