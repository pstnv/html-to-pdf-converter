import "express-async-errors"; // перехватчик ошибок в асинхронных функциях (вместо trycatch)
import dotenv from "dotenv"; // доступ к переменным среды
dotenv.config();

// Express
import express from "express";
const app = express();

// пакеты безопасности
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";
import xss from "express-mongo-sanitize";
// остальные пакеты
import cookieParser from "cookie-parser";
// обработчик загрузки файлов
import fileUpload from "express-fileupload";
import { ContentTooLargeError } from "./errors/index.js";
// базы данных
import connectDB from "./db/connectDB.js";
import { v2 as cloudinary } from "cloudinary";
// router
import { router } from "./routes/index.js";
// обработчики ошибок
import notFoundMiddleware from "./middleware/not-found.js";
import {
    errorTempFilesHandler,
    errorResponder,
} from "./middleware/error-handler.js";

// serve static files from the './public' directory
app.use(express.static("./public"));

// ====== MIDDLEWARE CONfIG ======

// ограничение частоты запросов к API
const rateLimitConfig = {
    windowMs: 15 * 60 * 1000, // временной интервал => 15 минут
    limit: 1000, // лимит запросов => 1000 запросов в 15 минут с каждого IP
    standardHeaders: "draft-7",
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    // store: ... , // Redis, Memcached, etc. See below.
    // message: "Вы превысили max количество запросов. Перерыв на 15 минут",
    // statusCode: 429 // статус-код после того, как лимит будет достигнут
    // handler, // коллбэк после того, как лимит будет достигнут (overrides message and statusCode settings, if set)
};
// фильтрация загружаемых файлов (по размеру)
// ограничение на максимальный размер загружаемого файла
const GIGABYTE = Math.pow(1024, 3);
const maxSizeGB = process.env.MAX_SIZE;
const maxSizeBytes = process.env.MAX_SIZE * GIGABYTE; // максимальный размер в байтах
const fileUploadConfig = {
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
};
// конфигурация cloudinary
const cloudinaryConfig = {
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
};

// ====== MIDDLEWARE SETUP ======

// express-rate-limit - ограничение частоты запросов к API
app.set("trust proxy", 1);
app.use(rateLimit(rateLimitConfig));
// helmet - защита приложения путем установки http-заголовков
app.use(helmet());
app.use(cors());
// xss - фильтрация пользовательского ввода от атак межсайтового скриптинга (req.body, req.query, req.params)
app.use(xss());

// ====== EXPRESS REQUEST MIDDLEWARE SETUP ======

// parse form data
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.JWT_SECRET));
app.use(express.json());
app.use(fileUpload(fileUploadConfig));
// базы данных
cloudinary.config(cloudinaryConfig);

// ====== SETUP ROUTES ======

// routes
app.use(router);
// 404 page not found
app.use(notFoundMiddleware);
// обработка ошибок
app.use(errorTempFilesHandler);
app.use(errorResponder);

export { app, connectDB };
