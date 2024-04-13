import path from "path";
import { BadRequestError } from "../errors/index.js";

const uploadController = (req, res, next) => {
    // проверки:
    // запрос, не содержащий файлы
    if (!req.files) {
        throw new BadRequestError("Файл не был загружен");
    }

    const file = req.files.file;
    // размер превышает maxSize
    if (file.maxSizeExceeded) {
        throw new BadRequestError(
            `Размер файла не должен превышать ${file.maxSizeGB}Гб`
        );
    }
    // формат не соответствует zip
    // или !file.mimetype.includes("zip")
    if (!file.name.endsWith(".zip")) {
        throw new BadRequestError("Загрузите zip-архив");
    }
    // добавляем поля name и basename
    const fileName = file.name;
    file.basename = fileName;
    file.name = path.parse(fileName).name;
    req.file = file;

    next();
};

export default uploadController;
