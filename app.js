import dotenv from "dotenv";
dotenv.config();

import express from "express";
const app = express();

import fileUpload from "express-fileupload";
import { BadRequestError } from "./errors/index.js";
const maxSizeGB = process.env.MAX_SIZE;
const maxSizeBytes = process.env.MAX_SIZE * 1024 * 1024 * 1024;

app.use(express.static("./public"));
app.use(express.json());
app.use(
    fileUpload({
        useTempFiles: true,
        limits: { fileSize: maxSizeBytes },
        abortOnLimit: true, // при превышении размера обрывает соединение
        // функция-обработчик при превышении размера maxSize
        // next(uploadError) передает rangeError в errorHandlerMiddleware
        // загруженный файл удаляется автоматически
        limitHandler: function (req, res, next) {
            const rangeError = new BadRequestError(
                `Размер файла не должен превышать ${maxSizeGB}Гб`
            );
            next(rangeError);
        },
    })
);

// connectDB
import connectDB from "./db/connectDB.js";
import { auth as authenticateUser } from "./middleware/authentication.js";
// routers
import { router as convertionRouter } from "./routes/convertionRoutes.js";
import { router as authRouter } from "./routes/auth.js";
import { router as conversionsRouter } from "./routes/conversions.js";
// error handler
import notFoundMiddleware from "./middleware/not-found.js";
import {
    errorTempFilesHandler,
    errorResponder,
} from "./middleware/error-handler.js";

// routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/conversions", authenticateUser, conversionsRouter);
app.use("/api/v1/convertion", convertionRouter);

// 404 page not found
app.use(notFoundMiddleware);
// обработка ошибок
app.use(errorTempFilesHandler);
app.use(errorResponder);

const port = process.env.PORT;
const mongoURI = process.env.MONGO_URI;
const start = async () => {
    try {
        await connectDB(mongoURI);
        app.listen(port, () => {
            console.log(`Server is listening on port ${port}`);
        });
    } catch (error) {
        console.log(error);
    }
};
start();
