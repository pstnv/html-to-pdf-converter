import "express-async-errors";
import dotenv from "dotenv";
dotenv.config();

// пакеты безопасности
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";
import xss from "express-mongo-sanitize";

import express from "express";
const app = express();

import fileUpload from "express-fileupload";
import { BadRequestError } from "./errors/index.js";
const maxSizeGB = process.env.MAX_SIZE;
const maxSizeBytes = process.env.MAX_SIZE * 1024 * 1024 * 1024;

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
app.use(express.json());
// helmet - защита приложения путем установки http-заголовков
app.use(helmet());
app.use(cors());
// xss - фильтрация пользовательского ввода от атак межсайтового скриптинга (req.body, req.query, req.params)
app.use(xss());
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
