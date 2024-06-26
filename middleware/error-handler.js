import fs from "fs";
import { dirname } from "path";
import { StatusCodes } from "http-status-codes";
import { CustomError } from "../errors/index.js";

const errorTempFilesHandler = (err, req, res, next) => {
    const file = req.file;
    // if the file has been downloaded - delete folder tmp
    if (file && file.tempFilePath) {
        // path to tmp folder
        const tmpFolder = dirname(file.tempFilePath);
        // delete all files in tmp folder, including tmp folder
        fs.rmSync(tmpFolder, {
            recursive: true,
            force: true, // forced deletion
            maxRetries: 2, // count of retries, if first one is failed
        });
    }

    next(err);
};

const errorResponder = (err, req, res, next) => {
    // if error is instance of CustomError,
    // create new error using props of this error
    let customError = {
        statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
        msg:
            err instanceof CustomError && err.message
                ? err.message
                : "Something went wrong. Try again later",
    };

    // if error is not instance of CustomError - transform it to userfriendly
    // if error is thrown from Mongoose:

    // error of fields validation when register
    // user dind't filled one or more required fields
    if (err.name === "ValidationError") {
        const errorsList = Object.values(err.errors);
        const fileds = errorsList.map((error) => error.message).join(", ");
        customError.msg =
            errorsList.length > 1
                ? `Fields ${fileds} are required`
                : `Field ${fileds} is required`;
        customError.statusCode = StatusCodes.BAD_REQUEST;
    }

    // error in userId (userId doesn't correspond requirements of length or content)
    if (err.name === "CastError") {
        customError.msg = `User with id: ${err.value} not found`;
        customError.statusCode = StatusCodes.NOT_FOUND;
    }

    // error code 11000 - (duplicate error) - email already exists
    if (err && err.code === 11000) {
        customError.msg = `Account ${Object.values(
            err.keyValue
        )} already exists`;
        customError.statusCode = StatusCodes.BAD_REQUEST;
    }
    // add prop errMessage to response for morgan middleware (logger)
    res.errMessage = customError.msg;

    return res.status(customError.statusCode).json({ msg: customError.msg });
};

export { errorTempFilesHandler, errorResponder };
