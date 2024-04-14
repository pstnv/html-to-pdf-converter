import fs from "fs";
import { dirname } from "path";
import StatusCodes from "http-status-codes";
import { CustomError } from "../errors/index.js";

const errorTempFilesHandler = (err, req, res, next) => {
    const file = req.file;

    // если файл был загружен, удаляем папку tmp
    if (file && file.tempFilePath) {
        // путь до папки tmp
        const tmpFolder = dirname(file.tempFilePath);
        // удаляет все файлы в папке tmp, включая папку tmp
        fs.rmSync(tmpFolder, {
            recursive: true,
            force: true, // принудительно
            maxRetries: 2, // количество попыток
        });
    }

    next(err);
};

const errorResponder = (err, req, res, next) => {
    let customError = {
        statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
        // если ошибка является кастомной (экземпляром класса CustomError) 
        // и имеет сообщение - используем его,
        // если нет - меняем на сообщение "Что-то пошло не так"
        msg:
            err instanceof CustomError && err.message
                ? err.message
                : "Что-то пошло не так. Попробуйте позже",
    };
    return res.status(customError.statusCode).json({ msg: customError.msg });
};

export { errorTempFilesHandler, errorResponder };
