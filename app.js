import "express-async-errors";
import dotenv from "dotenv";
dotenv.config();

// пакеты безопасности
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";
import xss from "express-mongo-sanitize";
// остальные пакеты
import cookieParser from "cookie-parser";

import express from "express";
const app = express();

import fileUpload from "express-fileupload";
// импортируем cloudinary и настраиваем доступ к нему
import { v2 as cloudinary } from "cloudinary";
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});
import { ContentTooLargeError } from "./errors/index.js";

app.use(express.static("./public"));

// express-rate-limit - ограничение частоты запросов к API
app.set("trust proxy", 1);
app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000, // временной интервал => 15 минут
        limit: 1000, // лимит запросов => 1000 запросов в 15 минут с каждого IP
        standardHeaders: "draft-7",
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
        // store: ... , // Redis, Memcached, etc. See below.
        // message: "Вы превысили max количество запросов. Перерыв на 15 минут",
        // statusCode: 429 // статус-код после того, как лимит будет достигнут
        // handler, // коллбэк после того, как лимит будет достигнут (overrides message and statusCode settings, if set)
    })
);
// parse form data
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.JWT_SECRET));
app.use(express.json());
// helmet - защита приложения путем установки http-заголовков
app.use(helmet());
app.use(cors());
// xss - фильтрация пользовательского ввода от атак межсайтового скриптинга (req.body, req.query, req.params)
app.use(xss());
// ограничение на максимальный размер загружаемого файла
const GIGABYTE = Math.pow(1024, 3);
const maxSizeGB = process.env.MAX_SIZE;
const maxSizeBytes = process.env.MAX_SIZE * GIGABYTE; // максимальный размер в байтах
app.use(
    fileUpload({
        useTempFiles: true,
        limits: { fileSize: maxSizeBytes },
        abortOnLimit: true, // при превышении размера обрывает соединение
        // функция-обработчик при превышении размера maxSize
        // next(uploadError) передает rangeError в errorHandlerMiddleware
        // загруженный файл удаляется автоматически
        limitHandler: function (req, res, next) {
            const rangeError = new ContentTooLargeError(
                `Размер файла не должен превышать ${maxSizeGB}Гб`
            );
            next(rangeError);
        },
    })
);

// connectDB
import connectDB from "./db/connectDB.js";
// routers
import { router as authRouter } from "./routes/authRoutes.js";
import { router as taskRouter } from "./routes/taskRoutes.js";
import { router as userRouter } from "./routes/userRouter.js";
// error handler
import notFoundMiddleware from "./middleware/not-found.js";
import {
    errorTempFilesHandler,
    errorResponder,
} from "./middleware/error-handler.js";

// routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/tasks", taskRouter);
app.use("/api/v1/users", userRouter);

// 404 page not found
app.use(notFoundMiddleware);
// обработка ошибок
app.use(errorTempFilesHandler);
app.use(errorResponder);

const port = process.env.PORT || 5001;
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
