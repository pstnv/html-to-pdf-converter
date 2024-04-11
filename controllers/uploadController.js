import path from "path";

const uploadController = (req, res, next) => {
    // проверки:
    // запрос, не содержащий файлы
    if (!req.files) {
        return res.status(404).send("Загрузите архив");
    }
    const file = req.files.file;
    // формат zip 
    // или !file.mimetype.includes("zip")
    if (!file.name.endsWith(".zip")) {
        return res.status(401).send("Не подходит формат");
    }
    // размер меньше 2Гб
    const maxSize = 2 * 1024 * 1024 * 1024; // 2Гб
    if (file.size >= maxSize) {
        return res.status(403).send("Слишком большой размер");
    }
    // добавляем поля name и basename
    const fileName = file.name;
    file.basename = fileName;
    file.name = path.parse(fileName).name;
    req.file = file;
    
    next();
};

export default uploadController;
