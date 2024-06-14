import express from "express";

// routers
import { router as authRouter } from "./authRoutes.js";
import { router as taskRouter } from "./taskRoutes.js";
import { router as userRouter } from "./userRouter.js";
import { router as swaggerRouter } from "./swaggerRouter.js";



const router = express.Router();

// routes
router.use("/api/v1/auth", authRouter);
router.use("/api/v1/tasks", taskRouter);
router.use("/api/v1/users", userRouter);
router.use("/api/v1/docs", swaggerRouter);

export { router };
