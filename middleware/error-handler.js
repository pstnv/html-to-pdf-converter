import fs from "fs";
import { dirname } from "path";
import { StatusCodes } from "http-status-codes";
import { CustomError } from "../errors/index.js";

const errorTempFilesHandler = (err, req, res, next) => {
    console.log('here2', err.message)
    console.log(err);
    console.log("Конец описания ошибки")
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
    // если ошибка является кастомной (экземпляром класса CustomError),
    // формируем новую ошибку, используя свойства переданной ошибки
    let customError = {
        statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
        msg:
            err instanceof CustomError && err.message
                ? err.message
                : "Что-то пошло не так. Попробуйте позже",
    };

    // если ошибка другого происхождения, то трансформируем ее в user friendly
    // если ошибка вернулась из Mongoose:

    // ошибка валидации полей при регистрации
    // пользователь не заполнил одно или несколько обязательных полей
    if (err.name === "ValidationError") {
        const errorsList = Object.values(err.errors);
        const fileds = errorsList.map((error) => error.message).join(", ");
        customError.msg =
            errorsList.length > 1
                ? `Поля ${fileds} обязательны для заполнения`
                : `Поле ${fileds} обязательно для заполнения`;
        customError.statusCode = StatusCodes.BAD_REQUEST;
    }

    // ошибка в userId (userId не соответствует требованиям по длине или содержанию)
    // - данные по userId не найдены
    if (err.name === "CastError") {
        console.log("Я здесь!")
        customError.msg = `Данные с id: ${err.value} пользователя не найдены`;
        customError.statusCode = StatusCodes.NOT_FOUND;
    }

    // код ошибки 11000 - (duplicate error) - email уже зарегистрирован
    if (err && err.code === 11000) {
        customError.msg = `Пользователь ${Object.values(
            err.keyValue
        )} уже существует`;
        customError.statusCode = StatusCodes.BAD_REQUEST;
    }

    return res.status(customError.statusCode).json({ msg: customError.msg });
};

export { errorTempFilesHandler, errorResponder };
