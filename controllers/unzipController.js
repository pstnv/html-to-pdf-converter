import path from "path";
import AdmZip from "adm-zip";
import asyncWrapper from "../middleware/async.js";

const unzipController = asyncWrapper((req, res, next) => {
    const { tempFilePath: zipFilePath, name: zipName } = req.file;
    // создаем путь папки, в которую будет извлечен архив
    // она будет находиться в той же временной папке, имя папки = имя архива
    const unzippedFolderPath = path.resolve(path.dirname(zipFilePath), zipName);

    // распаковываем архив в папку unzippedFolderPath
    const zip = new AdmZip(zipFilePath);
    zip.extractAllTo(unzippedFolderPath, true);

    // добавляем в req.file данные о папке, в которую извлечен архив
    req.file.unzippedFolder = {
        path: unzippedFolderPath,
        name: zipName,
    };

    next();
});

export default unzipController;
