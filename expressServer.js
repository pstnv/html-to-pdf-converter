import "express-async-errors"; // catch errors in async functions without using try-catch
import dotenv from "dotenv"; // acces to env variables
dotenv.config();

// Express
import express from "express";
const app = express();

// security packages
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";
import xss from "express-mongo-sanitize";
// other packages
import cookieParser from "cookie-parser";
// file upload package
import fileUpload from "express-fileupload";
import { ContentTooLargeError } from "./errors/index.js";
// DB
import connectDB from "./db/connectDB.js";
import { v2 as cloudinary } from "cloudinary";
// router
import { router } from "./routes/index.js";
// error handlers
import notFoundMiddleware from "./middleware/not-found.js";
import {
    errorTempFilesHandler,
    errorResponder,
} from "./middleware/error-handler.js";

// serve static files from the './public' directory
app.use(express.static("./public"));

// ====== MIDDLEWARE CONfIG ======

// limit the frequency of API requests
const rateLimitConfig = {
    windowMs: 15 * 60 * 1000, // time interval =< 15 mins
    limit: 1000, // request limit =< 1000 per 15 mins from every IP
    standardHeaders: "draft-7",
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    // store: ... , // Redis, Memcached, etc. See below.
    // message: "You have exceeded the maximum number of requests. Try again later",
    // statusCode: 429 // statuc code after reaching limit
    // handler, // cb function after reaching limit (overrides message and statusCode settings, if set)
};
// filer uploading files (by its size)
// limit on maximum upload file size
const GIGABYTE = Math.pow(1024, 3);
const maxSizeGB = process.env.MAX_SIZE;
const maxSizeBytes = process.env.MAX_SIZE * GIGABYTE; // max file size in bytes
const fileUploadConfig = {
    useTempFiles: true,
    limits: { fileSize: maxSizeBytes },
    abortOnLimit: true, // when reach max size breaks uploading
    // cb function after reaching max size
    // next(uploadError) passes rangeError to errorHandlerMiddleware
    // the downloaded file is deleted automatically
    limitHandler: function (req, res, next) {
        const rangeError = new ContentTooLargeError(
            `File size should not exceed: ${maxSizeGB}GB`
        );
        next(rangeError);
    },
};
// cloudinary configuration
const cloudinaryConfig = {
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
};

// ====== MIDDLEWARE SETUP ======

// express-rate-limit
app.set("trust proxy", 1);
app.use(rateLimit(rateLimitConfig));
// helmet - protecting the application by setting http headers
app.use(helmet());
app.use(cors());
// xss - filtering user input from cross-site scripting attacks (req.body, req.query, req.params)
app.use(xss());

// ====== EXPRESS REQUEST MIDDLEWARE SETUP ======

// parse form data
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.JWT_SECRET));
app.use(express.json());
app.use(fileUpload(fileUploadConfig));
// DB
cloudinary.config(cloudinaryConfig);

// ====== SETUP ROUTES ======

// routes
app.use(router);
// 404 page not found
app.use(notFoundMiddleware);
// error handlers
app.use(errorTempFilesHandler);
app.use(errorResponder);

export { app, connectDB };
