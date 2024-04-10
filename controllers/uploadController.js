import path from "path";

const uploadController = (req, res, next) => {
    // проверки:
    // запрос, не содержащий файлы
    if (!req.files) {
        return res.send("Загрузите архив");
    }
    const file = req.files.file;
    // формат zip
    if (file.mimetype !== "application/zip") {
        return res.send("Не подходит формат");
    }
    // размер меньше 2Гб
    const maxSize = 2 * 1024 * 1024 * 1024; // 2Гб
    if (file.size >= maxSize) {
        return res.send("Слишком большой размер");
    }
    const fileName = file.name;
    file.base = fileName;
    file.name = path.parse(fileName).name;
    req.file = file;
    next();
};

export default uploadController;
