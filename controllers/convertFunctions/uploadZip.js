import path from "path";
import { BadRequestError } from "../../errors/index.js";

const uploadZip = (req, res, next) => {
    // проверки:
    // запрос, не содержащий файлы
    if (!req.files) {
        throw new BadRequestError("Файл не был загружен");
    }

    const file = req.files.file;
    // формат не соответствует zip
    // или !file.mimetype.includes("zip")
    if (!file.name.endsWith(".zip")) {
        throw new BadRequestError("Загрузите zip-архив");
    }
    // добавляем поля name и basename
    const fileName = file.name; // имя файла без расширения
    file.basename = fileName; // имя файла с расширением
    file.name = path.parse(fileName).name;
    req.file = file;

    next();
};

export default uploadZip;
