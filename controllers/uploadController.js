import path from "path";
import { BadRequestError } from "../errors/index.js";

const uploadController = (req, res, next) => {
    // проверки:
    // запрос, не содержащий файлы
    if (!req.files) {
        throw new BadRequestError("Файл не был загружен");
    }
    const file = req.files.file;
    // формат zip
    // или !file.mimetype.includes("zip")
    if (!file.name.endsWith(".zip")) {
        throw new BadRequestError("Загрузите zip-архив");
    }
    // размер меньше 2Гб
    const maxSize = 2 * 1024 * 1024 * 1024; // 2Гб
    if (file.size >= maxSize) {
        throw BadRequestError("Размер файла не должен превышать 2Гб");
    }
    // добавляем поля name и basename
    const fileName = file.name;
    file.basename = fileName;
    file.name = path.parse(fileName).name;
    req.file = file;

    next();
};

export default uploadController;
