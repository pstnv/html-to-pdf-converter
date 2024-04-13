import dotenv from "dotenv";
dotenv.config();

import express from "express";
const app = express();

import fileUpload from "express-fileupload";
const maxSizeGB = process.env.MAX_SIZE;
const maxSizeBytes = process.env.MAX_SIZE * 1024 * 1024 * 1024;

app.use(express.static("./public"));
app.use(express.json());
app.use(
    fileUpload({
        useTempFiles: true,
        limits: { fileSize: maxSizeBytes },
        // функция-обработчик при превышении размера maxSize
        // добавляет поля maxSizeGB и отправляет в uploadController для обработки ошибок
        // иначе будет срабатывать внутренний обработчик Express
        limitHandler: function (req, res, next) {
            req.files = { file: { maxSizeGB, maxSizeExceeded: true } };
            next();
        },
    })
);

// routers
import { router as convertionRouter } from "./routes/convertionRoutes.js";
// error handler
import notFoundMiddleware from "./middleware/not-found.js";
import errorHandlerMiddleware from "./middleware/error-handler.js";
// routes
app.use("/api/v1/convertion", convertionRouter);

// 404 page not found
app.use(notFoundMiddleware);
// обработка ошибок
app.use(errorHandlerMiddleware);

const port = process.env.PORT;
const start = () => {
    try {
        app.listen(port, () => {
            console.log(`Server is listening on port ${port}`);
        });
    } catch (error) {
        console.log(error);
    }
};
start();
